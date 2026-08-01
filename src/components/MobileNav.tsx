'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuIcon, LogOutIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog';
import { AboutDialog } from '@/components/AboutDialog';
import { logoutAction } from '@/lib/auth/actions';
import { cn } from '@/lib/utils';

const LINKS = [{ href: '/', label: 'Impressos', exact: true }];
const ADMIN_LINKS = [
  { href: '/admin/users', label: 'Usuários', exact: false },
  { href: '/admin/settings', label: 'Configurações', exact: false },
  { href: '/admin/activity', label: 'Atividade', exact: false },
];

interface MobileNavProps {
  isAdmin: boolean;
  userName?: string;
  hasPassword: boolean;
}

// Cabeçalho é uma barra única sem breakpoint — abaixo de md os links e as
// ações de conta (tema, trocar senha, sair) ficam sem espaço na tela e sem
// nenhuma forma de acessá-los. Este menu junta tudo isso numa gaveta lateral
// só visível em telas estreitas (o header continua mostrando tudo inline em
// md+, ver Header.tsx).
export function MobileNav({ isAdmin, userName, hasPassword }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const links = isAdmin ? [...LINKS, ...ADMIN_LINKS] : LINKS;

  return (
    <div className="ml-auto md:hidden">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button type="button" variant="ghost" size="icon" aria-label="Abrir menu" />}>
          <MenuIcon />
        </DialogTrigger>
        <DialogContent
          showCloseButton
          className="top-0 left-0 flex h-dvh w-72 max-w-[85vw] translate-x-0 translate-y-0 flex-col gap-0 rounded-none rounded-r-xl p-0 data-open:slide-in-from-left data-closed:slide-out-to-left sm:max-w-[85vw]"
        >
          <DialogTitle className="sr-only">Menu de navegação</DialogTitle>

          <nav className="flex flex-col gap-1 p-3 pt-10">
            {links.map((link) => {
              const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground',
                    isActive && 'bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-3 border-t p-3">
            <div className="flex items-center justify-between px-1">
              <span className="truncate text-sm font-semibold text-foreground">{userName}</span>
              <div className="flex items-center">
                <AboutDialog />
                <ThemeToggle />
              </div>
            </div>
            {hasPassword && <ChangePasswordDialog hasExistingPassword={hasPassword} />}
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
                <LogOutIcon />
                Sair
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
