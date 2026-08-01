import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/guards';
import { Header } from '@/components/Header';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  // Senha provisória (definida pelo admin) ainda não foi trocada — força a
  // troca antes de liberar qualquer outra tela do sistema.
  if (user.mustChangePassword) {
    redirect('/change-password');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
