import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';

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

function secretMatches(input: string, expected: string): boolean {
  const a = Buffer.from(input, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function opaqueResponse(authorized = false) {
  return NextResponse.json({ ok: true, authorized });
}

export async function POST(request: Request) {
  try {
    if (!allowRequest(clientKey(request))) {
      return opaqueResponse(false);
    }

    let emailRaw = '';
    let passwordRaw = '';
    try {
      const body = (await request.json()) as { email?: unknown; password?: unknown };
      emailRaw = typeof body.email === 'string' ? body.email : '';
      passwordRaw = typeof body.password === 'string' ? body.password : '';
    } catch {
      return opaqueResponse(false);
    }

    const email = emailRaw.trim();
    const password = passwordRaw;

    const allowed = process.env.ADMIN_EMAIL?.trim();
    const expectedPassword = process.env.ADMIN_PASSWORD?.trim() ?? '';
    if (!allowed || !expectedPassword || !email || !password) {
      return opaqueResponse(false);
    }

    const isAuthorized =
      emailMatchesAllowed(email, allowed) && secretMatches(password, expectedPassword);

    return opaqueResponse(isAuthorized);
  } catch {
    return opaqueResponse(false);
  }
}
