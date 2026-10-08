// Sidebar navigation (single source of truth for routes and page titles).

export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '📊', group: 'Visão geral' },

  { href: '/appcc', label: 'APPCC', icon: '🎯', group: 'Programas' },
  { href: '/pacs', label: 'PACs', icon: '📋', group: 'Programas' },
  { href: '/temperaturas', label: 'Temperaturas', icon: '🌡️', group: 'Programas' },

  { href: '/rastreabilidade', label: 'Rastreabilidade', icon: '🔎', group: 'Operação' },
  { href: '/laboratorio', label: 'Laboratório', icon: '🧪', group: 'Operação' },
  { href: '/nao-conformidades', label: 'Não conformidades', icon: '⚠️', group: 'Operação' },
  { href: '/auditorias', label: 'Auditorias', icon: '✅', group: 'Operação' },

  { href: '/documentos', label: 'Documentos', icon: '📁', group: 'Gestão' },
  { href: '/produtos', label: 'Produtos', icon: '🥩', group: 'Gestão' },
  { href: '/treinamentos', label: 'Treinamentos', icon: '🎓', group: 'Gestão' },
];

export const NAV_GROUPS = ['Visão geral', 'Programas', 'Operação', 'Gestão'];

export function navItemFor(pathname) {
  if (!pathname) return NAV_ITEMS[0];
  const match = NAV_ITEMS.filter((item) => item.href !== '/')
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return match ?? NAV_ITEMS[0];
}
