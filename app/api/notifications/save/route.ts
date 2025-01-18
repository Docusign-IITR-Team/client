import { NextResponse } from 'next/server';
import clientPromise from '@/lib/utils/db';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);
    const { userId, message, fileLink } = await request.json();

    if (!userId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const notification = {
      userId,
      message,
      fileLink,
      read: false,
      createdAt: new Date().toISOString(),
      createdBy: session.user.email
    };

    const result = await db.collection('notifications').insertOne(notification);
    
    return NextResponse.json({
      success: true,
      notification: {
        ...notification,
        _id: result.insertedId
      }
    });
  } catch (error) {
    console.error('Error saving notification:', error);
    return NextResponse.json({ error: 'Failed to save notification' }, { status: 500 });
  }
}
