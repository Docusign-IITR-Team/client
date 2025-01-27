import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getServerSession } from 'next-auth';
import { docusign } from 'docusign-esign';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collaborators, subject, message } = await request.json();

    if (!collaborators || !Array.isArray(collaborators) || collaborators.length === 0) {
      return NextResponse.json({ error: 'No collaborators specified' }, { status: 400 });
    }

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const emailPromises = collaborators.map(async (email: string) => {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
          to: [email],
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">${subject}</h2>
              <p style="color: #374151; line-height: 1.6;">${message}</p>
              <p style="color: #6b7280; font-size: 0.875rem;">
                This notification was sent from Piwot. 
                The action was performed by ${session.user.email}.
              </p>
            </div>
          `,
        });
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        throw new Error(`Failed to send email to ${email}`);
      }
    });

    try {
      await Promise.all(emailPromises);
      return NextResponse.json({ 
        success: true,
        message: 'Emails sent successfully' 
      });
    } catch (error) {
      return NextResponse.json({ 
        error: 'Some emails failed to send',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in email API:', error);
    return NextResponse.json({ 
      error: 'Failed to process email request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


const apiClient = new docusign.ApiClient();
apiClient.setBasePath('https://demo.docusign.net/restapi');
apiClient.addDefaultHeader('Authorization', `Bearer ${process.env.DOCUSIGN_ACCESS_TOKEN}`);

const envelopesApi = new docusign.EnvelopesApi(apiClient);

export async function sendDocusignEmail(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipients, subject, message, documentBase64, documentName } = await request.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients specified' }, { status: 400 });
    }

    if (!subject || !message || !documentBase64 || !documentName) {
      return NextResponse.json({ error: 'Subject, message, documentBase64, and documentName are required' }, { status: 400 });
    }

    const envelopeDefinition = new docusign.EnvelopeDefinition();
    envelopeDefinition.emailSubject = subject;
    envelopeDefinition.emailBlurb = message;

    const document = new docusign.Document();
    document.documentBase64 = documentBase64;
    document.name = documentName;
    document.fileExtension = 'pdf';
    document.documentId = '1';

    envelopeDefinition.documents = [document];

    const signer = new docusign.Signer();
    signer.email = recipients[0];
    signer.name = 'Recipient Name';
    signer.recipientId = '1';
    signer.routingOrder = '1';

    const signHere = new docusign.SignHere();
    signHere.documentId = '1';
    signHere.pageNumber = '1';
    signHere.recipientId = '1';
    signHere.tabLabel = 'SignHereTab';
    signHere.xPosition = '200';
    signHere.yPosition = '300';

    const tabs = new docusign.Tabs();
    tabs.signHereTabs = [signHere];
    signer.tabs = tabs;

    envelopeDefinition.recipients = new docusign.Recipients();
    envelopeDefinition.recipients.signers = [signer];
    envelopeDefinition.status = 'sent';

    const results = await envelopesApi.createEnvelope(process.env.DOCUSIGN_ACCOUNT_ID, { envelopeDefinition });
    return NextResponse.json({ success: true, envelopeId: results.envelopeId });
  } catch (error) {
    console.error('Error in DocuSign API:', error);
    return NextResponse.json({ 
      error: 'Failed to send DocuSign email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}