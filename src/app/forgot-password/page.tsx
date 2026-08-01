import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { AuthCard } from '@/components/AuthCard';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) redirect('/');

  return (
    <AuthCard title="Esqueci minha senha">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
