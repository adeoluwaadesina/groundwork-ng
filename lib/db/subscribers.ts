import { getSql } from '@/lib/db';

export async function countSubscribers(): Promise<number> {
  const rows = await getSql()<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM subscribers
  `;
  return rows[0]?.count ?? 0;
}

export async function countSubscribersReceivingMail(): Promise<number> {
  const rows = await getSql()<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM subscribers WHERE receive_mail = true
  `;
  return rows[0]?.count ?? 0;
}

export async function subscribeEmail(email: string): Promise<{ alreadySubscribed: boolean }> {
  const existing = await getSql()<{ email: string }[]>`
    SELECT email FROM subscribers WHERE email = ${email}
  `;
  if (existing.length > 0) {
    await getSql()`
      UPDATE subscribers SET receive_mail = true WHERE email = ${email}
    `;
    return { alreadySubscribed: true };
  }
  await getSql()`INSERT INTO subscribers (email) VALUES (${email})`;
  return { alreadySubscribed: false };
}

export async function getUnsubscribeToken(email: string): Promise<string | null> {
  const rows = await getSql()<{ unsubscribe_token: string }[]>`
    SELECT unsubscribe_token::text FROM subscribers WHERE email = ${email}
  `;
  return rows[0]?.unsubscribe_token ?? null;
}

export async function unsubscribeByToken(token: string): Promise<string | null> {
  const rows = await getSql()<{ email: string }[]>`
    UPDATE subscribers
    SET receive_mail = false
    WHERE unsubscribe_token = ${token}::uuid
      AND receive_mail = true
    RETURNING email
  `;
  return rows[0]?.email ?? null;
}

export type MailSubscriberRow = { email: string; unsubscribe_token: string };

export async function listMailSubscribers(): Promise<MailSubscriberRow[]> {
  return getSql()<MailSubscriberRow[]>`
    SELECT email, unsubscribe_token::text AS unsubscribe_token
    FROM subscribers
    WHERE receive_mail = true
  `;
}
