import 'server-only';
import matter from 'gray-matter';
import type { FrameworkFormFields, FrameworkImportResult } from '@/lib/framework-form';

const MAX_BYTES = 2 * 1024 * 1024;

const FULL_SPLIT_MARKERS = [
  /\n---FULL---\n/i,
  /\n<!--\s*full\s*-->\n/i,
  /\n##\s*Full\s+Framework\s*\n/i,
  /\n#\s*Full\s+Framework\s*\n/i,
];

function asString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return '';
}

function tagsToString(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((t) => asString(t)).filter(Boolean).join(', ');
  }
  return asString(value);
}

function idFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '').trim();
  if (/^NR-[A-Z0-9]+-\d{3}$/i.test(base)) return base.toUpperCase();
  return '';
}

function splitLiteAndFull(body: string): { lite: string; full: string } {
  const trimmed = body.trim();
  if (!trimmed) return { lite: '', full: '' };

  for (const marker of FULL_SPLIT_MARKERS) {
    const match = trimmed.match(marker);
    if (match && match.index != null) {
      return {
        lite: trimmed.slice(0, match.index).trim(),
        full: trimmed.slice(match.index + match[0].length).trim(),
      };
    }
  }

  const blocks = trimmed.split(/\n\n+/).filter((b) => b.trim());
  if (blocks.length <= 3) {
    return { lite: trimmed, full: '' };
  }

  return {
    lite: blocks.slice(0, 3).join('\n\n'),
    full: blocks.slice(3).join('\n\n'),
  };
}

function titleFromMarkdownBody(body: string): string {
  const h1 = body.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : '';
}

function normalizeRecord(
  data: Record<string, unknown>,
  body: string,
  filename: string
): FrameworkImportResult {
  const warnings: string[] = [];
  const { lite, full } = splitLiteAndFull(body);

  const liteFromMeta =
    asString(data.lite) ||
    asString(data.lite_content) ||
    asString(data.overview);

  const fullFromMeta = asString(data.full) || asString(data.full_content);

  let lite_content = liteFromMeta || lite;
  let full_content = fullFromMeta || full;

  if (liteFromMeta && fullFromMeta) {
    lite_content = liteFromMeta;
    full_content = fullFromMeta;
  } else if (liteFromMeta && !fullFromMeta) {
    lite_content = liteFromMeta;
    full_content = body.trim() || full;
  } else if (!liteFromMeta && fullFromMeta) {
    full_content = fullFromMeta;
    lite_content = lite || lite_content;
  }

  const title =
    asString(data.title) || titleFromMarkdownBody(body) || titleFromMarkdownBody(lite_content);

  const fields: FrameworkFormFields = {
    id: asString(data.id) || idFromFilename(filename),
    title,
    subtitle: asString(data.subtitle),
    sector: asString(data.sector),
    date: asString(data.date),
    tags: tagsToString(data.tags),
    lite_content,
    full_content,
  };

  if (!fields.id) warnings.push('Framework ID was not found — enter one before publishing.');
  if (!fields.title) warnings.push('Title was not found — add a title before publishing.');
  if (!fields.lite_content && !fields.full_content) {
    warnings.push('No overview or full content detected — paste content manually.');
  }
  if (!fields.lite_content && fields.full_content) {
    warnings.push('Overview (lite) is empty — the first sections were placed in full content only.');
  }

  return { fields, warnings, source: filename };
}

function parseMarkdown(filename: string, raw: string): FrameworkImportResult {
  const { data, content } = matter(raw);
  return normalizeRecord(data as Record<string, unknown>, content, filename);
}

function parseJson(filename: string, raw: string): FrameworkImportResult {
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const body = asString(parsed.full_content) || asString(parsed.content) || '';
  return normalizeRecord(parsed, body, filename);
}

function parsePlainText(filename: string, raw: string): FrameworkImportResult {
  const lines = raw.split(/\r?\n/);
  const meta: Record<string, unknown> = {};
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const kv = line.match(/^([a-z_]+)\s*:\s*(.*)$/i);
    if (!kv) {
      bodyStart = i;
      break;
    }
    const key = kv[1].toLowerCase();
    const value = kv[2].trim();
    if (['id', 'title', 'subtitle', 'sector', 'date', 'tags'].includes(key)) {
      meta[key] = value;
    } else {
      bodyStart = i;
      break;
    }
  }

  const body = lines.slice(bodyStart).join('\n').trim();
  return normalizeRecord(meta, body, filename);
}

export function parseFrameworkFile(filename: string, raw: string): FrameworkImportResult {
  if (raw.length > MAX_BYTES) {
    throw new Error('File is too large (max 2 MB).');
  }

  const ext = filename.split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'json') {
    return parseJson(filename, raw);
  }
  if (ext === 'md' || ext === 'markdown') {
    return parseMarkdown(filename, raw);
  }
  if (ext === 'txt') {
    return parsePlainText(filename, raw);
  }

  if (raw.trimStart().startsWith('{')) {
    return parseJson(filename, raw);
  }
  if (raw.trimStart().startsWith('---')) {
    return parseMarkdown(filename, raw);
  }

  return parsePlainText(filename, raw);
}
