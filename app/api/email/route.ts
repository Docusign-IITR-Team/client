import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export async function POST(request: Request) {
  const req = await request.json();
  const { collaborators, subject, message } = req;

  try {
    const emailPromises = collaborators.map(async (email: string) => {
      await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: [email],
        subject: subject,
        html: `<p>${message}</p>`,
      });
    });

    await Promise.all(emailPromises);
    return NextResponse.json({ message: 'Emails sent successfully' }, { status: 200 }); //return res.status(200).json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending emails:', error);
    return NextResponse.json({ message: 'Failed to send emails' }, { status: 500 }); //return res.status(500).json({ message: 'Failed to send emails' });
  }
}
