import { requireUser } from '@/lib/auth/guards';
import { AuthCard } from '@/components/AuthCard';
import { StatusMessage } from '@/components/StatusMessage';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';

export default async function ChangePasswordPage() {
  const user = await requireUser();

  return (
    <AuthCard title="Trocar senha">
      {user.mustChangePassword && (
        <StatusMessage tone="info">
          Por segurança, defina uma nova senha antes de continuar.
        </StatusMessage>
      )}
      <ChangePasswordForm hasExistingPassword={user.hasPassword} />
    </AuthCard>
  );
}
