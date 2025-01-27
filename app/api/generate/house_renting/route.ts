import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { answers } = body;

    // Call the external generation API
    const response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/generate/house_renting`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers }),
    });

    if (!response.ok) {
      throw new Error('Generation service failed');
    }

    const generatedAgreement = await response.json();

    // Call the DocuSign API to send the generated agreement for signing
    const docusignResponse = await fetch(`https://demo.docusign.net/restapi/v2.1/accounts/${process.env.DOCUSIGN_ACCOUNT_ID}/envelopes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DOCUSIGN_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        emailSubject: 'Please sign the house renting agreement',
        documents: [
          {
            documentBase64: Buffer.from(generatedAgreement).toString('base64'),
            name: 'House Renting Agreement',
            fileExtension: 'pdf',
            documentId: '1',
          },
        ],
        recipients: {
          signers: [
            {
              email: session.user.email,
              name: session.user.name,
              recipientId: '1',
              routingOrder: '1',
            },
          ],
        },
        status: 'sent',
      }),
    });

    if (!docusignResponse.ok) {
      throw new Error('DocuSign service failed');
    }

    const docusignResult = await docusignResponse.json();
    return NextResponse.json(docusignResult);
  } catch (error) {
    console.error('Error generating agreement:', error);
    return NextResponse.json(
      { error: 'Failed to generate agreement' },
      { status: 500 }
    );
  }
}