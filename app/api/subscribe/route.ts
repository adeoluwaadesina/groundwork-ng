import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getFromEmail, getResend, resolveSiteUrl } from '@/lib/email/resend-client';
import { welcomeEmailHtml, welcomeEmailSubject } from '@/lib/email/templates';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Please provide a valid email.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const supabase = createAdminClient();
    let alreadySubscribed = false;

    const { error: dbError } = await supabase.from('subscribers').insert({ email: cleanEmail });

    if (dbError) {
      if (dbError.code === '23505') {
        alreadySubscribed = true;
        const { error: upErr } = await supabase
          .from('subscribers')
          .update({ receive_mail: true })
          .eq('email', cleanEmail);
        if (upErr) {
          console.error('Supabase subscribe re-opt-in error:', upErr);
          return NextResponse.json({ error: 'Could not update your subscription.' }, { status: 500 });
        }
      } else {
        console.error('Supabase subscribe error:', dbError);
        return NextResponse.json({ error: 'Could not save your subscription. Please try again.' }, { status: 500 });
      }
    }

    const { data: row, error: tokenErr } = await supabase
      .from('subscribers')
      .select('unsubscribe_token')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (tokenErr || !row?.unsubscribe_token) {
      console.error('Subscribe token fetch:', tokenErr);
    }

    const siteUrl = resolveSiteUrl();
    const unsubBase = `${siteUrl}/api/unsubscribe`;
    const unsubscribeUrl = row?.unsubscribe_token
      ? `${unsubBase}?token=${encodeURIComponent(String(row.unsubscribe_token))}`
      : null;

    const resend = getResend();
    const from = getFromEmail();
    if (resend && from) {
      try {
        const { error: sendError } = await resend.emails.send({
          from,
          to: [cleanEmail],
          subject: welcomeEmailSubject(),
          html: welcomeEmailHtml(unsubscribeUrl),
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

    return NextResponse.json({ success: true, alreadySubscribed });
  } catch (err) {
    console.error('Subscribe route error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
