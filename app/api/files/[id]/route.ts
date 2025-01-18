import { NextResponse } from 'next/server';
import clientPromise from '@/lib/utils/db';
import { ObjectId } from 'mongodb';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        console.log('Fetching file with ID:', params.id);
        
        const client = await clientPromise;
        const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);
        const collection = db.collection('files');
        
        const file = await collection.findOne({
            _id: new ObjectId(params.id)
        });
        
        if (!file) {
            console.log('File not found:', params.id);
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        console.log('Found file:', {
            id: file._id,
            name: file.name,
            contentLength: file.content?.length || 0
        });

        return NextResponse.json(file);
    } catch (e) {
        console.error('Error fetching file:', e);
        return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
    }
}
