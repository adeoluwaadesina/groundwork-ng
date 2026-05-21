import postgres from 'postgres';
import { validateServerEnv } from '@/lib/env';

type Sql = ReturnType<typeof postgres>;

const globalForDb = globalThis as typeof globalThis & { __groundworkSql?: Sql };

export function getSql(): Sql {
  validateServerEnv();
  if (!globalForDb.__groundworkSql) {
    const url = process.env.DATABASE_URL?.trim();
    if (!url) {
      throw new Error('DATABASE_URL is not set');
    }
    const local = url.includes('localhost') || url.includes('127.0.0.1');
    globalForDb.__groundworkSql = postgres(url, {
      ssl: local ? false : 'require',
      max: 10,
    });
  }
  return globalForDb.__groundworkSql;
}
