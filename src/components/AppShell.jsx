'use client';

import { Fragment, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NAV_GROUPS, NAV_ITEMS, navItemFor } from '@/lib/nav';

export default function AppShell({ children }) {
  const pathname = usePathname();
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

        {NAV_GROUPS.map((group) => (
          <Fragment key={group}>
            <div className="nav-group">{group}</div>
            {NAV_ITEMS.filter((item) => item.group === group).map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
              return (
                <a key={item.href} href={item.href} className={`nav-link${active ? ' active' : ''}`}>
                  <span className="icon" aria-hidden="true">{item.icon}</span>
                  {item.label}
                </a>
              );
            })}
          </Fragment>
        ))}
      </aside>

      <div className="main">
        <header className="topbar">
          <h1 className="topbar-title">{current.label}</h1>
          <div className="topbar-meta">
            <span className="badge badge--brand">Indústria de produtos de origem animal</span>
            {today ? <span>{today}</span> : null}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
