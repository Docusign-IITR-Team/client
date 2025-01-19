import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/utils/db';
import { authOptions } from '@/lib/utils/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename } = await request.json();
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Find the file by name and owner
    const file = await db.collection('files').findOne({
      name: filename,
      $or: [
        { owner: session.user.email },
        { sharedWith: session.user.email }
      ]
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ fileId: file._id });
  } catch (error) {
    console.error('Error in get-file-id route:', error);
    return NextResponse.json(
      { error: 'Failed to get file ID' },
      { status: 500 }
    );
  }
}
