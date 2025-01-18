import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);
        const collection = db.collection('files');
        
        const files = await collection.find({}).sort({ uploadedAt: -1 }).toArray();
        return NextResponse.json(files);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }
}
