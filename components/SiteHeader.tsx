'use client';

import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';

export function SiteHeader() {
  return (
    <header className="site-header">
      <BrandLogo variant="header" href="/" />
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
