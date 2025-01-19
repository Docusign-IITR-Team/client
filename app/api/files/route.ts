import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/utils/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const client = await clientPromise;
    const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);

    console.log('Fetching files for user:', session.user.email);

    const files = await db
      .collection('files')
      .find({
        $or: [
          { owner: session.user.email },
          { collaborators: session.user.email }
        ]
      })
      .project({
        name: 1,
        size: 1,
        updatedAt: 1,
        owner: 1,
        collaborators: 1
      })
      .sort({ updatedAt: -1 })
      .toArray();

    console.log('Found files:', files.length);

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
      });
    }

    if (!file.name.endsWith('.txt')) {
      return new NextResponse(JSON.stringify({ error: 'Only .txt files are allowed' }), {
        status: 400,
      });
    }

    const content = await file.text();
    const client = await clientPromise;
    const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);

    console.log('Creating file:', file.name);
    console.log('Owner email:', session.user.email);

    const result = await db.collection('files').insertOne({
      name: file.name,
      content,
      size: file.size,
      type: file.type,
      owner: session.user.email,
      collaborators: [], // Initialize empty collaborators array
      signatures: { [session.user.email]: false }, // Initialize signatures with owner
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('File created with ID:', result.insertedId);

    return NextResponse.json({ success: true, fileId: result.insertedId });
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
