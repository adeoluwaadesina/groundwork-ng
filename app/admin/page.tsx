import { AdminPanel } from './AdminPanel';
import { LoginForm } from './LoginForm';
import { listFrameworks } from '@/lib/db/frameworks';
import { countSubscribers, countSubscribersReceivingMail } from '@/lib/db/subscribers';
import { getAdminSession } from '@/lib/require-admin';
import type { Framework } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    return <LoginForm />;
  }

  const frameworks = await listFrameworks();
  const subscriberCount = await countSubscribers();
  const subscriberMailCount = await countSubscribersReceivingMail();
  const totalViews = frameworks.reduce((sum, f) => sum + (f.views || 0), 0);

  return (
    <AdminPanel
      frameworks={frameworks as Framework[]}
      subscriberCount={subscriberCount}
      subscriberMailCount={subscriberMailCount}
      totalViews={totalViews}
      userEmail={session.user?.email || ''}
    />
  );
}
