import { useEffect, useState, type PropsWithChildren, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { fetchPublicSettings, type PublicSettings } from '../api/settings';
import styles from './Layout.module.css';

interface LayoutProps {
  actions?: ReactNode;
}

const DEFAULT_BRANDING: PublicSettings = { companyName: 'Minha Empresa', logoUrl: null };

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? styles.navLinkActive : styles.navLink;
}

export function Layout({ children, actions }: PropsWithChildren<LayoutProps>) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [branding, setBranding] = useState<PublicSettings>(DEFAULT_BRANDING);

  useEffect(() => {
    fetchPublicSettings()
      .then(setBranding)
      .catch(() => setBranding(DEFAULT_BRANDING));
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.companyName} className={styles.logoImg} />
          ) : (
            <span className={styles.logoFallback} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 32 32">
                <path
                  d="M8 9l8 14 8-14"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
          <span className={styles.companyName}>{branding.companyName}</span>
        </div>

        <nav className={styles.nav}>
          <NavLink to="/" end className={navLinkClass}>
            Impressos
          </NavLink>
          {user?.role === 'ADMIN' && (
            <>
              <NavLink to="/admin/users" className={navLinkClass}>
                Usuários
              </NavLink>
              <NavLink to="/admin/settings" className={navLinkClass}>
                Configurações
              </NavLink>
            </>
          )}
        </nav>

        <div className={styles.headerActions}>
          {actions}
          <div className={styles.userMenu}>
            <span className={styles.userName}>{user?.name}</span>
            <button type="button" className={styles.logoutButton} onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
