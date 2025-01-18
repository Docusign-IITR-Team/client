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

        // Group replies with their parent comments
        const commentMap = new Map();
        const topLevelComments = [];

        comments.forEach(comment => {
            comment.replies = [];
            commentMap.set(comment._id.toString(), comment);
        });

        comments.forEach(comment => {
            if (comment.parentId) {
                const parent = commentMap.get(comment.parentId.toString());
                if (parent) {
                    parent.replies.push(comment);
                }
            } else {
                topLevelComments.push(comment);
            }
        });

        return NextResponse.json(topLevelComments);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fileId, lineNumber, comment, parentId } = body;

        if (!fileId || !comment) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);
        const collection = db.collection('comments');

        let commentDoc: any = {
            fileId: new ObjectId(fileId),
            comment,
            createdAt: new Date()
        };

        if (parentId) {
            // For replies, get the parent comment's line number
            const parentComment = await collection.findOne({ _id: new ObjectId(parentId) });
            if (!parentComment) {
                return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
            }
            commentDoc.lineNumber = parentComment.lineNumber;
            commentDoc.parentId = new ObjectId(parentId);
        } else {
            if (!lineNumber) {
                return NextResponse.json({ error: 'Line number is required for new comments' }, { status: 400 });
            }
            commentDoc.lineNumber = lineNumber;
        }

        commentDoc.commentKey = `${commentDoc.fileId}:/L${commentDoc.lineNumber}`;
        
        const result = await collection.insertOne(commentDoc);
        const newComment = await collection.findOne({ _id: result.insertedId });

        return NextResponse.json({
            message: 'Comment added successfully',
            comment: newComment
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
    }
}
