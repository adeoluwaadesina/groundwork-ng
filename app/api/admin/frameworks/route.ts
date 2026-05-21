import { NextResponse } from 'next/server';
import {
  deleteFramework,
  insertFramework,
  updateFramework,
  type FrameworkWritePayload,
} from '@/lib/db/frameworks';
import { requireAdminApi } from '@/lib/require-admin';

function parsePayload(body: unknown): FrameworkWritePayload | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const id = typeof b.id === 'string' ? b.id.trim() : '';
  const title = typeof b.title === 'string' ? b.title.trim() : '';
  if (!id || !title) return null;
  const tagsRaw = b.tags;
  const tags = Array.isArray(tagsRaw)
    ? tagsRaw.filter((t): t is string => typeof t === 'string').map((t) => t.trim()).filter(Boolean)
    : typeof tagsRaw === 'string'
      ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
  return {
    id,
    title,
    subtitle: typeof b.subtitle === 'string' ? b.subtitle.trim() : '',
    sector: typeof b.sector === 'string' ? b.sector.trim() : '',
    date: typeof b.date === 'string' ? b.date.trim() : '',
    tags,
    lite_content: typeof b.lite_content === 'string' ? b.lite_content : '',
    full_content: typeof b.full_content === 'string' ? b.full_content : '',
  };
}

export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = await request.json();
    const payload = parsePayload(body);
    if (!payload) {
      return NextResponse.json({ error: 'Framework ID and title are required.' }, { status: 400 });
    }
    await insertFramework(payload);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Framework insert error:', err);
    const message = err instanceof Error ? err.message : 'Save failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = await request.json();
    const editId = typeof (body as { editId?: unknown })?.editId === 'string'
      ? (body as { editId: string }).editId.trim()
      : '';
    if (!editId) {
      return NextResponse.json({ error: 'editId is required.' }, { status: 400 });
    }
    const payload = parsePayload(body);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid framework data.' }, { status: 400 });
    }
    await updateFramework(editId, {
      title: payload.title,
      subtitle: payload.subtitle,
      sector: payload.sector,
      date: payload.date,
      tags: payload.tags,
      lite_content: payload.lite_content,
      full_content: payload.full_content,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Framework update error:', err);
    const message = err instanceof Error ? err.message : 'Save failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const id = new URL(request.url).searchParams.get('id')?.trim();
    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }
    await deleteFramework(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Framework delete error:', err);
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 });
  }
}
