import { timingSafeEqual } from 'crypto';

export function emailMatchesAllowed(input: string, allowed: string): boolean {
  const a = Buffer.from(input.trim().toLowerCase(), 'utf8');
  const b = Buffer.from(allowed.trim().toLowerCase(), 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function secretMatches(input: string, expected: string): boolean {
  const a = Buffer.from(input, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const allowed = process.env.ADMIN_EMAIL?.trim();
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim() ?? '';
  if (!allowed || !expectedPassword || !email || !password) return false;
  return emailMatchesAllowed(email, allowed) && secretMatches(password, expectedPassword);
}
