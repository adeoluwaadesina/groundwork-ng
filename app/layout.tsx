import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Ground Work · Frameworks for what Nigeria actually needs',
  description:
    'Policy. Infrastructure. Reality-checked frameworks for Nigeria. By Adeoluwa Adesina.',
  authors: [{ name: 'Adeoluwa Adesina' }],
  icons: {
    icon: [{ url: '/brand/icon.png', type: 'image/png' }],
    apple: [{ url: '/brand/icon.png', type: 'image/png' }],
  },
  openGraph: {
    title: 'Ground Work / NR',
    description: 'Policy and infrastructure frameworks for Nigeria\'s future.',
    type: 'website',
    images: [{ url: '/brand/logo-primary.png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
