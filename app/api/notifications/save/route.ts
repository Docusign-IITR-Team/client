import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/utils/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const { userId, message, fileLink } = await request.json();

    const notification = {
      id: new Date().toISOString(),
      userId,
      message,
      fileLink,
      createdAt: new Date(),
    };

    await db.collection('notifications').insertOne(notification);
    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error saving notification:', error);
    return NextResponse.json({ error: 'Failed to save notification' }, { status: 500 });
  }
}
