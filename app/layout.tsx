import type { Metadata } from 'next';
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
      <body>{children}</body>
    </html>
  );
}
