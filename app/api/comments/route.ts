import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/utils/db';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
        const topLevelComments: any = [];

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
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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
            email: session.user.email,
            createdAt: new Date().toISOString(),
            ...(parentId && { parentId: new ObjectId(parentId) }),
        };

        if (parentId) {
            // For replies, get the parent comment's line number
            const parentComment = await collection.findOne({ _id: new ObjectId(parentId) });
            if (!parentComment) {
                return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
            }
            commentDoc.lineNumber = parentComment.lineNumber;
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

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const commentId = searchParams.get('commentId');

        if (!commentId) {
            return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);
        const collection = db.collection('comments');

        const comment = await collection.findOne({ _id: new ObjectId(commentId) });

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        if (comment.email !== session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await collection.deleteOne({ _id: new ObjectId(commentId) });

        return NextResponse.json({ message: 'Comment deleted successfully' });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }
}