import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/utils/db';
import { authOptions } from '@/lib/utils/auth';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function retryFetch(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryFetch(url, options, retries - 1);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clause } = await request.json();
    if (!clause) {
      return NextResponse.json({ error: 'Clause is required' }, { status: 400 });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Get all agreements for the user with improved query
    const agreements = await db.collection('files')
      .find({
        $or: [
          { owner: session.user.email },
          { sharedWith: session.user.email }
        ],
        $or: [
          { type: 'agreement' },
          { name: { $regex: /agreement|contract/i } }
        ],
        content: { $exists: true, $ne: '' } // Ensure content exists and is not empty
      })
      .toArray();

    console.log(`Found ${agreements.length} agreements for analysis`);

    if (agreements.length === 0) {
      return NextResponse.json({
        analysis: {
          text: "I don't see any existing agreements to compare with. Please add some agreements first, and then I can help analyze potential conflicts."
        }
      });
    }

    // Extract text content from agreements
    const existingClauses = agreements.map(agreement => {
      console.log(`Processing agreement: ${agreement.name}`);
      return `Agreement: ${agreement.name}\n${agreement.content}\n---\n`;
    }).join('\n');

    // Construct the query for GROQ
    const query = `
      You are a legal document analyzer. Analyze this new clause for potential conflicts with existing agreements.
      
      New Clause:
      "${clause}"

      Existing Agreements:
      "${existingClauses}"

      Please:
      1. Identify any potential conflicts or inconsistencies
      2. Point out specific agreements that might be affected (reference them by name)
      3. Suggest possible modifications if needed
      4. Consider legal implications
      
      Format your response in a clear, structured way.
    `;

    try {
      // Forward to GROQ API with retry logic
      const groqResponse = await retryFetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: query }),
      });

      const analysis = await groqResponse.json();
      const analysisText =analysis.retrieverSimilarity[0]?.pageContent;
      const metadata=analysis.retrieverSimilarity[0]?.metadata;
      console.log("ANALYSIS",analysisText);
      console.log("METADATA",metadata);

      return NextResponse.json({ analysisText,metadata });
    } catch (error) {
      console.error('Error connecting to GROQ API:', error);
      return NextResponse.json({
        analysis: {
          text: "I'm currently unable to analyze the clause due to a technical issue. Please try again in a few moments. If the problem persists, please contact support."
        }
      }, { status: 200 }); // Still return 200 to show a user-friendly message
    }
  } catch (error) {
    console.error('Error in analyze-clause route:', error);
    return NextResponse.json(
      { error: 'Failed to analyze clause' },
      { status: 500 }
    );
  }
}

