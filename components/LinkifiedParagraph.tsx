'use client';

import type { ReactNode } from 'react';

/**
 * Renders plain text with http(s) and www. URLs turned into external links.
 * Text is not interpreted as HTML.
 */
export function LinkifiedParagraph({ text }: { text: string }) {
  const re = /https?:\/\/[^\s<>"{}|\\^`[\])]+|www\.[^\s<>"{}|\\^`[\])]+/gi;
  const nodes: ReactNode[] = [];
  let last = 0;
  let ki = 0;

  const matches = Array.from(text.matchAll(re));
  for (const m of matches) {
    const index = m.index ?? 0;
    if (index > last) {
      nodes.push(<span key={`t-${ki++}`}>{text.slice(last, index)}</span>);
    }
    const raw = m[0];
    const cleaned = raw.replace(/[.,;:!?)]+$/, '');
    const href = cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;
    nodes.push(
      <a
        key={`a-${ki++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="reader-inline-link"
      >
        {cleaned}
      </a>
    );
    last = index + raw.length;
  }

  if (last < text.length) {
    nodes.push(<span key={`t-${ki++}`}>{text.slice(last)}</span>);
  }

  return <>{nodes}</>;
}
