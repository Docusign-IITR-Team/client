import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);
        const collection = db.collection('files');
        
        const results = await collection.find({}).toArray();
        return NextResponse.json(results);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!file.name.endsWith('.txt')) {
            return NextResponse.json({ error: 'Only .txt files are allowed' }, { status: 400 });
        }

        const fileContent = await file.text();
        console.log('File content:', fileContent); // Debug log
        
        const client = await clientPromise;
        const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);
        const collection = db.collection('files');

        const result = await collection.insertOne({
            name: file.name,
            content: fileContent,
            size: file.size,
            type: file.type,
            uploadedAt: new Date()
        });

        // Debug log
        console.log('Saved document:', {
            id: result.insertedId,
            name: file.name,
            contentLength: fileContent.length
        });

        return NextResponse.json({ 
            message: 'File uploaded successfully',
            fileId: result.insertedId 
        });
    } catch (e) {
        console.error('Upload error:', e);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
