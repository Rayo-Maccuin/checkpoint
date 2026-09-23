import type { Metadata } from 'next';

import 'goey-toast/styles.css';
import './globals.css';

import { GoeyToaster } from '@/shared/components/goey-toaster';
import { AppSplash } from '@/shared/components/app-splash';

export const metadata: Metadata = {
  title: 'Checkpoint',
  description: 'Continúa donde dejaste tus proyectos.',
  icons: {
    icon: '/checkpoint-icon.svg',
    shortcut: '/checkpoint-icon.svg',
    apple: '/checkpoint-icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AppSplash />
        {children}

        <GoeyToaster />
      </body>
    </html>
  );
}