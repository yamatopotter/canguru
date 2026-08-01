import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { peekPasswordResetToken } from '@/lib/auth/passwordReset';
import { AuthCard } from '@/components/AuthCard';
import { StatusMessage } from '@/components/StatusMessage';
import { ResetPasswordForm } from './ResetPasswordForm';

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const user = await getCurrentUser();
  if (user) redirect('/');

  const { token } = await searchParams;
  const record = token ? await peekPasswordResetToken(token) : null;

  if (!token || !record) {
    return (
      <AuthCard title="Link inválido">
        <StatusMessage tone="error">
          Este link de redefinição de senha é inválido ou já expirou.
        </StatusMessage>
        <Link href="/forgot-password" className="self-center text-sm font-medium text-primary hover:underline">
          Solicitar um novo link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Definir nova senha">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
