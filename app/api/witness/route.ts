import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileName } = body;

    if (!fileName) {
      return NextResponse.json({ error: 'No file name provided' }, { status: 400 });
    }

    console.log('Calling witness service for file:', fileName);
    
    const response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/witness`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Witness service error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate witness' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Witness generated successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating witness:', error);
    return NextResponse.json(
      { error: 'Failed to generate witness' },
      { status: 500 }
    );
  }
}
