import { MongoClient } from "mongodb";

if (!process.env.NEXT_PUBLIC_MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

if (!process.env.NEXT_PUBLIC_MONGODB_DB) {
  throw new Error('Invalid/Missing environment variable: "DB_NAME"');
}

const uri = `${process.env.NEXT_PUBLIC_MONGODB_URI}/${process.env.NEXT_PUBLIC_MONGODB_DB}`;
const options = {};

let clientPromise: Promise<MongoClient>;

try {
  if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    const client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} catch (error) {
  console.error("Error connecting to MongoDB:", error);
  clientPromise = Promise.reject(error);
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
