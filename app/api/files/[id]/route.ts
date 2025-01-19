import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/utils/db';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);

    // Find file where user is either owner or collaborator
    const file = await db.collection('files').findOne({
      _id: new ObjectId(params.id),
      $or: [
        { owner: session.user.email },
        { collaborators: session.user.email }
      ]
    });

    if (!file) {
      return NextResponse.json(
        { error: "File not found or you don't have access" },
        { status: 404 }
      );
    }

    return NextResponse.json({ file });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB);

    // First check if the user is the owner
    const file = await db.collection('files').findOne({
      _id: new ObjectId(params.id)
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const body = await request.json();

    // If updating content, only owner can do it
    if (body.content !== undefined && file.owner !== session.user.email) {
      return NextResponse.json(
        { error: 'Only the owner can modify the file content' },
        { status: 403 }
      );
    }

    // If updating collaborators, only owner can do it
    if (body.collaborators !== undefined && file.owner !== session.user.email) {
      return NextResponse.json(
        { error: 'Only the owner can modify collaborators' },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (body.content !== undefined) {
      updateData.content = body.content;
      updateData.updatedAt = new Date().toISOString();
      // Reset all signatures when content changes
      const signatures: { [key: string]: boolean } = {};
      [file.owner, ...(file.collaborators || [])].forEach(email => {
        signatures[email] = false;
      });
      updateData.signatures = signatures;
    }
    if (body.collaborators !== undefined) {
      updateData.collaborators = body.collaborators;
      // Add new collaborators to signatures with false value
      const signatures = { ...(file.signatures || {}) };
      body.collaborators.forEach((email: string) => {
        if (signatures[email] === undefined) {
          signatures[email] = false;
        }
      });
      updateData.signatures = signatures;
    }
    if (body.signatures !== undefined) {
      // Only allow users to update their own signature
      const signatures = { ...(file.signatures || {}) };
      if (body.signatures[session.user.email] !== undefined) {
        signatures[session.user.email] = body.signatures[session.user.email];
        updateData.signatures = signatures;

        // Check if this was the last signature needed
        const allSigners = [file.owner, ...(file.collaborators || [])];
        const allSigned = allSigners.every(email => signatures[email] === true);

        if (allSigned) {
          // Call witness API internally
          try {
            const witnessResponse = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/witness`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ fileName: file.name }),
            });

            if (!witnessResponse.ok) {
              console.error('Failed to generate witness:', await witnessResponse.text());
            }
          } catch (error) {
            console.error('Error calling witness service:', error);
          }
        }
      }
    }

    const result = await db.collection('files').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Fetch and return the updated file
    const updatedFile = await db.collection('files').findOne({
      _id: new ObjectId(params.id)
    });

    return NextResponse.json({ 
      success: true,
      file: updatedFile
    });
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}
