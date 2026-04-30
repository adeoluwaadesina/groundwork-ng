import type { ReactNode } from 'react';
import { AdminHashSession } from './AdminHashSession';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminHashSession />
      {children}
    </>
  );
}
