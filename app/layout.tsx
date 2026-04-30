import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { AuthHashFragmentHandler } from '@/components/AuthHashFragmentHandler';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ground Work · Frameworks for what Nigeria actually needs',
  description: 'Policy and infrastructure frameworks for Nigeria\'s future. By Adeoluwa Adesina.',
  authors: [{ name: 'Adeoluwa Adesina' }],
  openGraph: {
    title: 'Ground Work',
    description: 'Policy and infrastructure frameworks for Nigeria\'s future.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthHashFragmentHandler />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
