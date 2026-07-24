import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login?next=/dashboard&reason=auth');
  }

  return <DashboardClient />;
}
