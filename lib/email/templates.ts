import type { Framework } from '@/lib/types';

const BG = '#FFFFFF';
const INK = '#0F0F0E';
const INK_SOFT = '#6E6E68';
const GREEN = '#1A5C38';
const GREEN_LIGHT = '#2D7A50';
const BORDER = '#ECECE6';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapDocument(inner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};">
${inner}
</body>
</html>`;
}

export function welcomeEmailSubject(): string {
  return "You're on the Ground Work list";
}

export function welcomeEmailHtml(): string {
  const inner = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
  <tr>
    <td style="padding:32px 24px;font-family:Georgia,'Times New Roman',serif;color:${INK};font-size:16px;line-height:1.65;">
      <p style="margin:0 0 20px 0;font-family:system-ui,-apple-system,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${GREEN};">Ground Work</p>
      <p style="margin:0 0 16px 0;">Thank you for subscribing.</p>
      <p style="margin:0 0 16px 0;color:${INK_SOFT};">You will get a short note when a new framework is published: context on Nigeria's policy and infrastructure landscape, without noise. This is editorial work by Adeoluwa Adesina.</p>
      <p style="margin:0;color:${INK_SOFT};font-size:14px;">If the emails are not useful, you can ignore them. The site stays the source for the full text.</p>
      <p style="margin:28px 0 0 0;font-family:system-ui,-apple-system,sans-serif;font-size:13px;color:${INK_SOFT};">Adeoluwa Adesina<br><span style="color:${GREEN};">Ground Work</span></p>
    </td>
  </tr>
</table>`;
  return wrapDocument(inner);
}

function liteContentToParagraphsHtml(lite: string): string {
  const trimmed = lite.trim();
  if (!trimmed) {
    return `<p style="margin:0 0 16px 0;color:${INK_SOFT};font-style:italic;">(Overview not set for this framework.)</p>`;
  }
  const blocks = trimmed.split(/\n\s*\n/).filter(Boolean);
  return blocks
    .map((block) => {
      const lines = block.trim().split('\n');
      const withBreaks = lines.map((line) => escapeHtml(line)).join('<br/>');
      return `<p style="margin:0 0 16px 0;">${withBreaks}</p>`;
    })
    .join('');
}

export function broadcastEmailSubject(framework: Framework): string {
  return `New framework: ${framework.title}`;
}

export function broadcastEmailHtml(framework: Framework, siteUrl: string): string {
  const url = `${siteUrl}/framework/${encodeURIComponent(framework.id)}`;
  const sector = framework.sector?.trim() || 'General';
  const inner = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
  <tr>
    <td style="padding:32px 24px;font-family:Georgia,'Times New Roman',serif;color:${INK};font-size:16px;line-height:1.65;">
      <p style="margin:0 0 20px 0;font-family:system-ui,-apple-system,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${GREEN};">Ground Work</p>
      <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:600;line-height:1.25;color:${INK};">${escapeHtml(framework.title)}</h1>
      <p style="margin:0 0 20px 0;font-family:system-ui,-apple-system,sans-serif;font-size:13px;color:${INK_SOFT};">
        <strong style="color:${INK};font-weight:600;">${escapeHtml(framework.id)}</strong>
        <span style="color:${BORDER};"> · </span>
        ${escapeHtml(sector)}
      </p>
      ${liteContentToParagraphsHtml(framework.lite_content || '')}
      <p style="margin:24px 0 0 0;">
        <a href="${escapeHtml(url)}" style="display:inline-block;font-family:system-ui,-apple-system,sans-serif;font-size:14px;font-weight:500;color:${BG};background:${GREEN};text-decoration:none;padding:10px 18px;border-radius:3px;">Read the full framework</a>
      </p>
      <p style="margin:16px 0 0 0;font-family:system-ui,-apple-system,sans-serif;font-size:13px;">
        <a href="${escapeHtml(url)}" style="color:${GREEN_LIGHT};text-decoration:underline;">${escapeHtml(url)}</a>
      </p>
      <p style="margin:28px 0 0 0;font-family:system-ui,-apple-system,sans-serif;font-size:13px;color:${INK_SOFT};">Adeoluwa Adesina · Ground Work</p>
    </td>
  </tr>
</table>`;
  return wrapDocument(inner);
}
