import { getSql } from '@/lib/db';
import type { Framework } from '@/lib/types';

export async function listFrameworks(): Promise<Framework[]> {
  return getSql()<Framework[]>`
    SELECT * FROM frameworks ORDER BY published_at DESC
  `;
}

export async function getFrameworkById(id: string): Promise<Framework | null> {
  const rows = await getSql()<Framework[]>`
    SELECT * FROM frameworks WHERE id = ${id}
  `;
  return rows[0] ?? null;
}

export async function incrementFrameworkViews(id: string): Promise<number | null> {
  const rows = await getSql()<{ increment_views: number }[]>`
    SELECT increment_views(${id}) AS increment_views
  `;
  const n = rows[0]?.increment_views;
  return typeof n === 'number' ? n : null;
}

export type FrameworkWritePayload = {
  id: string;
  title: string;
  subtitle: string;
  sector: string;
  date: string;
  tags: string[];
  lite_content: string;
  full_content: string;
};

export async function insertFramework(payload: FrameworkWritePayload): Promise<void> {
  await getSql()`
    INSERT INTO frameworks (
      id, title, subtitle, sector, date, tags, lite_content, full_content
    ) VALUES (
      ${payload.id},
      ${payload.title},
      ${payload.subtitle},
      ${payload.sector},
      ${payload.date},
      ${payload.tags},
      ${payload.lite_content},
      ${payload.full_content}
    )
  `;
}

export async function updateFramework(
  id: string,
  payload: Omit<FrameworkWritePayload, 'id'>
): Promise<void> {
  await getSql()`
    UPDATE frameworks SET
      title = ${payload.title},
      subtitle = ${payload.subtitle},
      sector = ${payload.sector},
      date = ${payload.date},
      tags = ${payload.tags},
      lite_content = ${payload.lite_content},
      full_content = ${payload.full_content}
    WHERE id = ${id}
  `;
}

export async function deleteFramework(id: string): Promise<void> {
  await getSql()`DELETE FROM frameworks WHERE id = ${id}`;
}
