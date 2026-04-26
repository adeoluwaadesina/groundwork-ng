'use client';

import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="site-logo">
        GROUND WORK <span>/ NR</span>
      </Link>
      <nav className="header-nav">
        <Link href="/admin">Admin</Link>
        <button
          className="btn-subscribe"
          onClick={() => {
            const el = document.getElementById('subscribe');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else window.location.href = '/#subscribe';
          }}
        >
          Subscribe
        </button>
      </nav>
    </header>
  );
}
