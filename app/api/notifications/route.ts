import { NextRequest } from 'next/server';
import clientPromise from '@/lib/utils/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
    try {
      const session = await getServerSession();
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const searchParams = request.nextUrl.searchParams;
      const userId = searchParams.get('userId');

      if (!userId) {
        return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
      }

      // Verify the user is requesting their own notifications
      if (userId !== session.user.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const client = await clientPromise;
      const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);
      
      const notifications = await db.collection('notifications').find({ 
        userId,
        read: { $ne: true } // Only get unread notifications
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(50) // Limit to latest 50 notifications
      .toArray();

      return NextResponse.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}
