import { NextResponse } from 'next/server';
import { parseFrameworkFile } from '@/lib/parse-framework-file';
import { requireAdminApi } from '@/lib/require-admin';

export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { filename, content } = body as Record<string, unknown>;
  if (typeof filename !== 'string' || typeof content !== 'string') {
    return NextResponse.json({ error: 'filename and content are required.' }, { status: 400 });
  }

  try {
    const result = parseFrameworkFile(filename, content);
    return NextResponse.json({
      fields: result.fields,
      warnings: result.warnings,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not parse file.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
