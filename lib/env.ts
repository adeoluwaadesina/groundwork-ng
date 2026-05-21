const SERVER_ENV_KEYS = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
] as const;

let validated = false;

export function validateServerEnv(): void {
  if (validated) return;
  validated = true;

  const missing = SERVER_ENV_KEYS.filter((key) => !process.env[key]?.trim());
  if (missing.length === 0) return;

  const message = `[groundwork] Missing env: ${missing.join(', ')}. Check .env.local (quote DATABASE_URL if it contains &).`;
  if (process.env.NODE_ENV === 'development') {
    console.warn(message);
  } else {
    console.error(message);
  }
}
