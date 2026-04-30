import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 10;
const rateState = new Map<string, { n: number; until: number }>();

function clientKey(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function allowRequest(key: string): boolean {
  const now = Date.now();
  rateState.forEach((v, k) => {
    if (now > v.until) rateState.delete(k);
  });
  const cur = rateState.get(key);
  if (!cur || now > cur.until) {
    rateState.set(key, { n: 1, until: now + RATE_WINDOW_MS });
    return true;
  }
  if (cur.n >= RATE_MAX) return false;
  cur.n += 1;
  return true;
}

function emailMatchesAllowed(input: string, allowed: string): boolean {
  const a = Buffer.from(input.trim().toLowerCase(), 'utf8');
  const b = Buffer.from(allowed.trim().toLowerCase(), 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function isEmailShape(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function callbackRedirectUrl(request: Request): string {
  const nextPath = '/admin';
  const q = `next=${encodeURIComponent(nextPath)}`;
  const origin = request.headers.get('origin');
  if (origin && /^https?:\/\//i.test(origin)) {
    return `${origin.replace(/\/$/, '')}/auth/callback?${q}`;
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (base) {
    return `${base}/auth/callback?${q}`;
  }
  return `http://localhost:3000/auth/callback?${q}`;
}

function opaqueOk() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  try {
    if (!allowRequest(clientKey(request))) {
      return opaqueOk();
    }

    let emailRaw = '';
    try {
      const body = (await request.json()) as { email?: unknown };
      emailRaw = typeof body.email === 'string' ? body.email : '';
    } catch {
      return opaqueOk();
    }

    const email = emailRaw.trim();
    if (!email || !isEmailShape(email)) {
      return opaqueOk();
    }

    const allowed = process.env.ADMIN_EMAIL?.trim();
    if (!allowed) {
      return opaqueOk();
    }

    if (!emailMatchesAllowed(email, allowed)) {
      return opaqueOk();
    }

    const supabase = createAdminClient();
    const redirectTo = callbackRedirectUrl(request);

    const { error } = await supabase.auth.signInWithOtp({
      email: allowed,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      return opaqueOk();
    }

    return opaqueOk();
  } catch {
    return opaqueOk();
  }
}
