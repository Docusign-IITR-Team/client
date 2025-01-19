import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/utils/db';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ count: 0 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);
    
    // Get unread notifications count for the user
    const count = await db.collection('notifications').countDocuments({
      recipient: session.user.email,
      read: false
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    return NextResponse.json({ count: 0 });
  }
}
