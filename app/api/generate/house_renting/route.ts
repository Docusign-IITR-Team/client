import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { answers } = body;

    // Call the external generation API
    const response = await fetch('http://localhost:3001/generate/house_renting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers }),
    });

    if (!response.ok) {
      throw new Error('Generation service failed');
    }

    const generatedAgreement = await response.json();
    return NextResponse.json(generatedAgreement);
  } catch (error) {
    console.error('Error generating agreement:', error);
    return NextResponse.json(
      { error: 'Failed to generate agreement' },
      { status: 500 }
    );
  }
}
