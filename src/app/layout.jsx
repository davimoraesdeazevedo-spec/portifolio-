import './globals.css';
import AppShell from '@/components/AppShell';

export const metadata = {
  title: 'Autocontrole — PAC, APPCC e Rastreabilidade',
  description:
    'Gestão de Programas de Autocontrole (PAC), APPCC, rastreabilidade e controle de qualidade para indústrias de produtos de origem animal registradas no SIM, SISBI, SIE e SIF.',
  applicationName: 'Autocontrole',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Autocontrole', statusBarStyle: 'default' },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport = {
  themeColor: '#0e7c66',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
