import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getFromEmail, getResend } from '@/lib/email/resend-client';
import { welcomeEmailHtml, welcomeEmailSubject } from '@/lib/email/templates';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Please provide a valid email.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const supabase = createAdminClient();

    const { error: dbError } = await supabase.from('subscribers').insert({ email: cleanEmail });

    if (dbError) {
      if (dbError.code === '23505') {
        return NextResponse.json({ success: true, alreadySubscribed: true });
      }
      console.error('Supabase subscribe error:', dbError);
      return NextResponse.json({ error: 'Could not save your subscription. Please try again.' }, { status: 500 });
    }

    const resend = getResend();
    const from = getFromEmail();
    if (resend && from) {
      try {
        const { error: sendError } = await resend.emails.send({
          from,
          to: [cleanEmail],
          subject: welcomeEmailSubject(),
          html: welcomeEmailHtml(),
        });
        if (sendError) {
          console.error('Resend welcome email error:', sendError);
        }
      } catch (resendErr) {
        console.error('Resend welcome email failed:', resendErr);
      }
    } else if (!process.env.RESEND_API_KEY || !from) {
      console.warn('Subscribe: RESEND_API_KEY or FROM_EMAIL missing, skipping welcome email.');
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe route error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
