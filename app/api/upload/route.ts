import { NextResponse } from 'next/server';
import clientPromise from '@/lib/utils/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/utils/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);
        
        const files = await db
            .collection('files')
            .find({
                $or: [
                    { owner: session.user.email },
                    { collaborators: session.user.email }
                ]
            })
            .project({
                name: 1,
                size: 1,
                updatedAt: 1,
                owner: 1,
                collaborators: 1
            })
            .sort({ updatedAt: -1 })
            .toArray();

        return NextResponse.json(files);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string;
        
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!file.name.endsWith('.txt')) {
            return NextResponse.json({ error: 'Only .txt files are allowed' }, { status: 400 });
        }

        const fileContent = await file.text();
        
        const client = await clientPromise;
        const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);
        const collection = db.collection('files');

        const result = await collection.insertOne({
            name: file.name,
            content: fileContent,
            size: file.size,
            type: type || 'document', // 'agreement' for agreements, 'document' for general uploads
            createdAt: new Date(),
            updatedAt: new Date(),
            owner: session.user.email,
            collaborators: []
        });

        return NextResponse.json({
            success: true,
            fileId: result.insertedId,
            message: 'File uploaded successfully'
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}


export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const fileId = formData.get('fileId') as string;
        const file = formData.get('file') as File;
        
        if (!fileId) {
            return NextResponse.json({ error: 'No file ID provided' }, { status: 400 });
        }

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!file.name.endsWith('.txt')) {
            return NextResponse.json({ error: 'Only .txt files are allowed' }, { status: 400 });
        }

        const fileContent = await file.text();
        
        const client = await clientPromise;
        const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);
        const collection = db.collection('files');

        const result = await collection.updateOne(
            { _id: new ObjectId(fileId), owner: session.user.email },
            {
                $set: {
                    name: file.name,
                    content: fileContent,
                    size: file.size,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'File not found or not authorized' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'File updated successfully'
        });

    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json(
            { error: 'Failed to update file' },
            { status: 500 }
        );
    }
}