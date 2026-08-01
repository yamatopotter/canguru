import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { toPublicUser } from '@/lib/publicUser';
import { UsersManager } from './UsersManager';

export default async function AdminUsersPage() {
  const currentUser = await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  const activeAdminCount = users.filter((user) => user.role === 'ADMIN' && user.active).length;

  return (
    <UsersManager
      users={users.map(toPublicUser)}
      currentUserId={currentUser.id}
      activeAdminCount={activeAdminCount}
    />
  );
}
