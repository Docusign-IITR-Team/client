import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  console.log('SLA route called');
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      console.log('Unauthorized: No session or email');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { answers } = body;
    console.log('Received answers in SLA route:', answers);

    // Call the external generation API
    console.log('Calling external SLA generation service');
    const response = await fetch('http://localhost:3001/generate/sla', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answers: {
          ...answers,
          category: 'sla' // Ensure category is set correctly
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Generation service error response:', errorText);
      throw new Error('Generation service failed');
    }

    const generatedAgreement = await response.json();
    console.log('Successfully generated SLA agreement');
    return NextResponse.json(generatedAgreement);
  } catch (error) {
    console.error('Error generating agreement:', error);
    return NextResponse.json(
      { error: 'Failed to generate agreement' },
      { status: 500 }
    );
  }
}