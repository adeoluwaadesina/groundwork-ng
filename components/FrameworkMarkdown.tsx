'use client';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

const mdComponents: Components = {
  h1: ({ children }) => <h1 className="reader-md-h1">{children}</h1>,
  h2: ({ children }) => <h2 className="reader-md-h2">{children}</h2>,
  h3: ({ children }) => <h3 className="reader-md-h3">{children}</h3>,
  h4: ({ children }) => <h4 className="reader-md-h4">{children}</h4>,
  hr: () => <hr className="reader-md-hr" />,
  blockquote: ({ children }) => <blockquote className="reader-md-blockquote">{children}</blockquote>,
  ul: ({ children }) => <ul className="reader-md-ul">{children}</ul>,
  ol: ({ children }) => <ol className="reader-md-ol">{children}</ol>,
  li: ({ children }) => <li className="reader-md-li">{children}</li>,
  strong: ({ children }) => <strong className="reader-md-strong">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  a: ({ href, children, node: _node, ...rest }) => {
    const external = typeof href === 'string' && /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        className="reader-inline-link"
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  },
  code: ({ className, children, node: _node, ...rest }) => {
    const inline = !className;
    if (inline) {
      return (
        <code className="reader-md-code-inline" {...rest}>
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="reader-md-pre">{children}</pre>,
  table: ({ children }) => (
    <div className="reader-md-table-wrap">
      <table className="reader-md-table">{children}</table>
    </div>
  ),
};

export function FrameworkMarkdown({ content }: { content: string }) {
  if (!content.trim()) return null;
  return (
    <div className="reader-markdown">
      <Markdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {content}
      </Markdown>
    </div>
  );
}
