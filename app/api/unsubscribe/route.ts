import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function page(title: string, body: string, ok: boolean) {
  const color = ok ? '#1A5C38' : '#8B4513';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;font-family:system-ui,sans-serif;background:#FDFDFC;color:#0F0F0E;padding:2rem;line-height:1.6;">
  <p style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${color};">Ground Work</p>
  <h1 style="font-size:1.25rem;font-weight:600;margin:0 0 1rem;">${title}</h1>
  <p style="color:#6E6E68;max-width:32rem;">${body}</p>
  <p style="margin-top:2rem;"><a href="/" style="color:#1A5C38;">Return to site</a></p>
</body>
</html>`;
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')?.trim() ?? '';
  if (!token || !UUID_RE.test(token)) {
    return new NextResponse(page('Invalid link', 'This unsubscribe link is not valid.', false), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('subscribers')
      .update({ receive_mail: false })
      .eq('unsubscribe_token', token)
      .eq('receive_mail', true)
      .select('email')
      .maybeSingle();

    if (error) {
      console.error('Unsubscribe update error:', error);
      return new NextResponse(
        page('Something went wrong', 'Please try again later or contact the editor.', false),
        { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    if (!data?.email) {
      return new NextResponse(
        page(
          'Already updated',
          'This link was already used, or we could not find a matching subscription. You will not receive further broadcast emails from this list.',
          true
        ),
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    return new NextResponse(
      page(
        'You are unsubscribed from emails',
        'You remain on the Ground Work list, but we will not send you newsletter or framework announcement emails. You can still read everything on the site. If you subscribe again from the homepage, email can be turned back on.',
        true
      ),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (e) {
    console.error('Unsubscribe route error:', e);
    return new NextResponse(page('Error', 'Something went wrong.', false), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}
