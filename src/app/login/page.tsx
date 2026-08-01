import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { isZohoConfigured } from '@/lib/zoho';
import { StatusMessage } from '@/components/StatusMessage';
import { AuthCard } from '@/components/AuthCard';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { LoginForm } from './LoginForm';

interface LoginPageProps {
  searchParams: Promise<{ error?: string; reset?: string }>;
}

const ZOHO_ERROR_MESSAGES: Record<string, string> = {
  zoho: 'Não foi possível concluir o login com Zoho. Tente novamente.',
  not_registered:
    'Sua conta Zoho ainda não está cadastrada neste sistema. Peça a um administrador para criar seu acesso.',
  oauth_disabled: 'Login via Zoho não está habilitado para esta conta. Fale com um administrador.',
  inactive: 'Seu usuário está desativado. Fale com um administrador.',
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) redirect('/');

  const { error, reset } = await searchParams;
  const zohoConfigured = await isZohoConfigured();

  return (
    <AuthCard title="Entrar">
      {error && (
        <StatusMessage tone="error">
          {ZOHO_ERROR_MESSAGES[error] ?? 'Não foi possível fazer login.'}
        </StatusMessage>
      )}

      {reset === 'success' && (
        <StatusMessage tone="success">Senha redefinida com sucesso. Faça login com a nova senha.</StatusMessage>
      )}

      <LoginForm />

      {zohoConfigured && (
        <>
          <div className="relative flex items-center py-1">
            <Separator className="flex-1" />
            <span className="px-3 text-xs text-muted-foreground">ou</span>
            <Separator className="flex-1" />
          </div>
          <a href="/api/auth/zoho/start" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
            Entrar com Zoho
          </a>
        </>
      )}
    </AuthCard>
  );
}
