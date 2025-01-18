import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/utils/db';
import { NextResponse } from 'next/server';

export default async function GET(req: NextApiRequest) {
    try {
      const client = await clientPromise;
      const db = client.db();
      const userId = req.query.userId; // Get user ID from query
      const notifications = await db.collection('notifications').find({ userId }).toArray();
      return NextResponse.json(notifications); //res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

}
