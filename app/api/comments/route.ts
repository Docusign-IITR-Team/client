import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
        return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);
        const collection = db.collection('comments');
        
        const comments = await collection.find({
            fileId: new ObjectId(fileId)
        }).sort({ createdAt: -1 }).toArray();

        return NextResponse.json(comments);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fileId, lineNumber, comment } = body;

        if (!fileId || !comment || !lineNumber) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const objectId = new ObjectId(fileId);
        const commentKey = `${objectId}:/L${lineNumber}`;
        
        const client = await clientPromise;
        const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);
        const collection = db.collection('comments');

        const result = await collection.insertOne({
            fileId: objectId,
            commentKey,
            comment,
            lineNumber,
            createdAt: new Date()
        });

        return NextResponse.json({
            message: 'Comment added successfully',
            commentId: result.insertedId,
            commentKey
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
    }
}
