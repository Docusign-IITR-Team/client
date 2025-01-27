import fs from 'fs';
import docusign from 'docusign-esign';

// Function to send email notifications to collaborators
export const sendEmailNotification = async (collaborators: string[], subject: string, message: string) => {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collaborators,
        subject,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

interface EnvelopeArgs {
  signerEmail: string;
  signerName: string;
  ccEmail: string;
  ccName: string;
  status: string;
  doc2File: string;
  doc3File: string;
}

export const makeEnvelope = (args: EnvelopeArgs) => {
  let doc2DocxBytes, doc3PdfBytes;
  doc2DocxBytes = fs.readFileSync(args.doc2File);
  doc3PdfBytes = fs.readFileSync(args.doc3File);

  let env = new docusign.EnvelopeDefinition();
  env.emailSubject = 'Please sign this document set';

  let doc1 = new docusign.Document();
  let doc1b64 = Buffer.from(document1(args)).toString('base64');
  let doc2b64 = Buffer.from(doc2DocxBytes).toString('base64');
  let doc3b64 = Buffer.from(doc3PdfBytes).toString('base64');
  doc1.documentBase64 = doc1b64;
  doc1.name = 'Order acknowledgement';
  doc1.fileExtension = 'html';
  doc1.documentId = '1';

  let doc2 = new docusign.Document.constructFromObject({
    documentBase64: doc2b64,
    name: 'Battle Plan',
    fileExtension: 'docx',
    documentId: '2',
  });

  let doc3 = new docusign.Document.constructFromObject({
    documentBase64: doc3b64,
    name: 'Lorem Ipsum',
    fileExtension: 'pdf',
    documentId: '3',
  });

  env.documents = [doc1, doc2, doc3];

  let signer1 = docusign.Signer.constructFromObject({
    email: args.signerEmail,
    name: args.signerName,
    recipientId: '1',
    routingOrder: '1',
  });

  let cc1 = new docusign.CarbonCopy();
  cc1.email = args.ccEmail;
  cc1.name = args.ccName;
  cc1.routingOrder = '2';
  cc1.recipientId = '2';

  let signHere1 = docusign.SignHere.constructFromObject({
    anchorString: '**signature_1**',
    anchorYOffset: '10',
    anchorUnits: 'pixels',
    anchorXOffset: '20',
  });
  let signHere2 = docusign.SignHere.constructFromObject({
    anchorString: '/sn1/',
    anchorYOffset: '10',
    anchorUnits: 'pixels',
    anchorXOffset: '20',
  });

  let signer1Tabs = docusign.Tabs.constructFromObject({
    signHereTabs: [signHere1, signHere2],
  });
  signer1.tabs = signer1Tabs;

  let recipients = docusign.Recipients.constructFromObject({
    signers: [signer1],
    carbonCopies: [cc1],
  });
  env.recipients = recipients;

  env.status = args.status;

  return env;
};

const document1 = (args: EnvelopeArgs) => {
  return `
    <!DOCTYPE html>
    <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family:sans-serif;margin-left:2em;">
        <h1 style="font-family: 'Trebuchet MS', Helvetica, sans-serif;
            color: darkblue;margin-bottom: 0;">World Wide Corp</h1>
        <h2 style="font-family: 'Trebuchet MS', Helvetica, sans-serif;
          margin-top: 0px;margin-bottom: 3.5em;font-size: 1em;
          color: darkblue;">Order Processing Division</h2>
        <h4>Ordered by ${args.signerName}</h4>
        <p style="margin-top:0em; margin-bottom:0em;">Email: ${args.signerEmail}</p>
        <p style="margin-top:0em; margin-bottom:0em;">Copy to: ${args.ccName}, ${args.ccEmail}</p>
        <p style="margin-top:3em;">
  Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly. Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o. Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.
        </p>
        <h3 style="margin-top:3em;">Agreed: <span style="color:white;">**signature_1**/</span></h3>
        </body>
    </html>
  `;
};