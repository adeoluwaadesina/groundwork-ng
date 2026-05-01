import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import type { Framework } from '@/lib/types';
import { chunk } from '@/lib/email/chunk';
import { getFromEmail, getResend, resolveSiteUrl } from '@/lib/email/resend-client';
import { broadcastEmailHtml, broadcastEmailSubject } from '@/lib/email/templates';

export async function POST(request: Request) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (!adminEmail) {
      return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
    }

    const supabaseAuth = createClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    const userEmail = user?.email?.trim().toLowerCase();
    if (!userEmail || userEmail !== adminEmail) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const frameworkId =
      typeof body?.frameworkId === 'string' ? body.frameworkId.trim() : '';
    if (!frameworkId) {
      return NextResponse.json({ error: 'frameworkId is required.' }, { status: 400 });
    }

    const resend = getResend();
    const from = getFromEmail();
    if (!resend || !from) {
      return NextResponse.json(
        { error: 'Email is not configured. Set RESEND_API_KEY and FROM_EMAIL.' },
        { status: 503 }
      );
    }

    const admin = createAdminClient();

    const { data: frameworkRow, error: fwError } = await admin
      .from('frameworks')
      .select('*')
      .eq('id', frameworkId)
      .maybeSingle();

    if (fwError) {
      console.error('Broadcast framework fetch:', fwError);
      return NextResponse.json({ error: 'Could not load framework.' }, { status: 500 });
    }
    if (!frameworkRow) {
      return NextResponse.json({ error: 'Framework not found.' }, { status: 404 });
    }

    const framework = frameworkRow as Framework;

    const { data: subscriberRows, error: subError } = await admin
      .from('subscribers')
      .select('email');

    if (subError) {
      console.error('Broadcast subscribers fetch:', subError);
      return NextResponse.json({ error: 'Could not load subscribers.' }, { status: 500 });
    }

    const emails = Array.from(
      new Set(
        (subscriberRows || [])
          .map((r) => (typeof r.email === 'string' ? r.email.trim().toLowerCase() : ''))
          .filter((e) => e.includes('@'))
      )
    );

    if (emails.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No subscribers to email.' });
    }

    const siteUrl = resolveSiteUrl();
    const subject = broadcastEmailSubject(framework);
    const html = broadcastEmailHtml(framework, siteUrl);

    let sent = 0;
    const batchErrors: string[] = [];

    for (const group of chunk(emails, 100)) {
      const payload = group.map((to) => ({
        from,
        to: [to],
        subject,
        html,
      }));

      const { data, error } = await resend.batch.send(payload);

      if (error) {
        console.error('Resend batch error:', error);
        batchErrors.push(typeof error.message === 'string' ? error.message : 'Batch send failed.');
        continue;
      }

      const n = data?.data?.length ?? group.length;
      sent += n;
    }

    return NextResponse.json({
      success: batchErrors.length === 0,
      sent,
      subscriberCount: emails.length,
      errors: batchErrors.length ? batchErrors : undefined,
    });
  } catch (err) {
    console.error('Broadcast route error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
