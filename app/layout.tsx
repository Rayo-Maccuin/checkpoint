import type { Metadata } from 'next';

import 'goey-toast/styles.css';
import './globals.css';

import { GoeyToaster } from '@/shared/components/goey-toaster';

export const metadata: Metadata = {
  title: 'Checkpoint',
  description: 'Continúa donde dejaste tus proyectos.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}

        <GoeyToaster />
      </body>
    </html>
  );
}