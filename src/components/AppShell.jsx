'use client';

import { Fragment, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { NAV_GROUPS, NAV_ITEMS, navItemFor } from '@/lib/nav';
import { labelCargo } from '@/lib/roles';
import { AuthProvider, useAuth } from './AuthProvider';

export default function AppShell({ children }) {
  const pathname = usePathname();

  // A tela de login não usa o shell: sem barra lateral e sem exigir sessão.
  if (pathname === '/login') return <>{children}</>;

  return (
    <AuthProvider>
      <AuthedShell pathname={pathname}>{children}</AuthedShell>
    </AuthProvider>
  );
}

function AuthedShell({ pathname, children }) {
  const router = useRouter();
  const { usuario, carregando, sair, pode } = useAuth();
  const [today, setToday] = useState('');
  const current = navItemFor(pathname);

  // Rendered after mount so the date never causes a hydration mismatch.
  useEffect(() => {
    setToday(new Date().toLocaleDateString('pt-BR'));
  }, []);

  // The service worker is only registered in a production build so it can never
  // serve a stale bundle over the dev server in the preview.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  // Sem sessão válida, volta para a tela de login.
  useEffect(() => {
    if (!carregando && !usuario) router.replace('/login');
  }, [carregando, usuario, router]);

  if (carregando) return <div className="loading">Verificando acesso…</div>;
  if (!usuario) return null;

  const items = NAV_ITEMS.filter((item) => !item.permissao || pode(item.permissao));

  return (
    <div className="layout">
      <aside className="sidebar no-print">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">🥩</div>
          <div>
            <div className="brand-name">Autocontrole</div>
            <div className="brand-sub">SIM · SISBI · SIE · SIF</div>
          </div>
        </div>

        {NAV_GROUPS.map((group) => {
          const groupItems = items.filter((item) => item.group === group);
          if (groupItems.length === 0) return null;
          return (
            <Fragment key={group}>
              <div className="nav-group">{group}</div>
              {groupItems.map((item) => {
                const active = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
                return (
                  <a key={item.href} href={item.href} className={`nav-link${active ? ' active' : ''}`}>
                    <span className="icon" aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </a>
                );
              })}
            </Fragment>
          );
        })}
      </aside>

      <div className="main">
        <header className="topbar">
          <h1 className="topbar-title">{current.label}</h1>
          <div className="topbar-meta">
            <span className="badge badge--brand">Indústria de produtos de origem animal</span>
            {today ? <span>{today}</span> : null}
            <span className="user-chip">
              <span className="user-chip-name">{usuario.nome}</span>
              <span className="user-chip-cargo">{labelCargo(usuario.cargo)}</span>
            </span>
            <button type="button" className="btn btn--sm no-print" onClick={sair}>Sair</button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
