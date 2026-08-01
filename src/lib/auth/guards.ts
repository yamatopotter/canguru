import 'server-only';
import { redirect } from 'next/navigation';
import { getCurrentUser, type CurrentUser } from './currentUser';

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== 'ADMIN') redirect('/');
  return user;
}
