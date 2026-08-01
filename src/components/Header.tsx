import { getCurrentUser } from '../lib/auth/currentUser';
import { logoutAction } from '../lib/auth/actions';
import { NavLinks } from './NavLinks';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from './ThemeToggle';
import { Mascot } from './Mascot';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { AboutDialog } from './AboutDialog';
import { Button } from '@/components/ui/button';
import { APP_VERSION } from '@/lib/version';
import { LogOutIcon } from 'lucide-react';

export async function Header() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="flex items-center gap-4 border-b bg-background px-4 py-3.5 sm:gap-8 sm:px-7">
      <div className="flex min-w-0 items-center gap-2">
        <Mascot size={28} />
        <span className="truncate text-sm font-bold text-foreground">Canguru</span>
        <span className="hidden text-xs text-muted-foreground sm:inline">v{APP_VERSION}</span>
      </div>

      <div className="hidden flex-1 items-center gap-8 md:flex">
        <NavLinks isAdmin={isAdmin} />

        <div className="flex items-center gap-4">
          <AboutDialog />
          <ThemeToggle />
          <div className="flex items-center gap-2.5 border-l pl-4">
            <span className="text-sm font-semibold whitespace-nowrap text-foreground">{user?.name}</span>
            {user?.hasPassword && <ChangePasswordDialog hasExistingPassword={user.hasPassword} />}
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOutIcon />
                Sair
              </Button>
            </form>
          </div>
        </div>
      </div>

      <MobileNav isAdmin={isAdmin} userName={user?.name} hasPassword={user?.hasPassword ?? false} />
    </header>
  );
}
