'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavLinksProps {
  isAdmin: boolean;
}

const LINKS = [{ href: '/', label: 'Impressos', exact: true }];
const ADMIN_LINKS = [
  { href: '/admin/users', label: 'Usuários', exact: false },
  { href: '/admin/settings', label: 'Configurações', exact: false },
  { href: '/admin/activity', label: 'Atividade', exact: false },
];

export function NavLinks({ isAdmin }: NavLinksProps) {
  const pathname = usePathname();
  const links = isAdmin ? [...LINKS, ...ADMIN_LINKS] : LINKS;

  return (
    <nav className="flex flex-1 gap-1">
      {links.map((link) => {
        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground',
              isActive && 'bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
