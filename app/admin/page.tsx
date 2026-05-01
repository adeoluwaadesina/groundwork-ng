import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { AdminPanel } from './AdminPanel';
import { LoginForm } from './LoginForm';
import type { Framework } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, show login form
  if (!user) {
    return <LoginForm />;
  }

  // Check email matches admin
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = user.email?.trim().toLowerCase();
  if (!adminEmail || userEmail !== adminEmail) {
    await supabase.auth.signOut();
    redirect('/admin');
  }

  // Load frameworks + stats
  const { data: frameworks } = await supabase
    .from('frameworks')
    .select('*')
    .order('published_at', { ascending: false });

  const { count: subCount } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact', head: true });

  const { count: subMailCount } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('receive_mail', true);

  const totalViews = (frameworks || []).reduce((sum, f) => sum + (f.views || 0), 0);

  return (
    <AdminPanel
      frameworks={(frameworks || []) as Framework[]}
      subscriberCount={subCount || 0}
      subscriberMailCount={subMailCount ?? 0}
      totalViews={totalViews}
      userEmail={user.email || ''}
    />
  );
}
