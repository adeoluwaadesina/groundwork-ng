import { readFileSync } from 'fs';
import { resolve } from 'path';

const path = resolve(process.cwd(), '.env.local');
const raw = readFileSync(path, 'utf8');
const env = {};

for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq);
  let value = trimmed.slice(eq + 1);
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  env[key] = value;
}

console.log('DATABASE_URL:', !!env.DATABASE_URL, 'length:', env.DATABASE_URL?.length ?? 0);
console.log('NEXTAUTH_SECRET:', !!env.NEXTAUTH_SECRET);
console.log('ADMIN_EMAIL:', !!env.ADMIN_EMAIL);
if (env.DATABASE_URL?.includes('channel_binding')) {
  console.log('DATABASE_URL includes channel_binding: OK');
} else if (env.DATABASE_URL) {
  console.log('DATABASE_URL may be truncated at &');
}

if (!env.DATABASE_URL || !env.NEXTAUTH_SECRET || !env.ADMIN_EMAIL) {
  process.exit(1);
}
