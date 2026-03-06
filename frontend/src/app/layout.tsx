import type { Metadata } from 'next';
import { Nunito, Inter, Marck_Script, Public_Sans } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { SocketProvider } from '@/providers/socket-provider';
import { ConditionalLayout } from '@/components/layout/ConditionalLayout';
import { Toaster } from '@/components/ui/sonner';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['700', '800'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const marckScript = Marck_Script({
  variable: '--font-script',
  subsets: ['latin'],
  weight: '400',
});

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '900'],
});

export const metadata: Metadata = {
  title: 'Entraidance',
  description: 'Trouvez des solutions, Soyez la solution. Tout simplement.',
  manifest: '/manifest.json',
  themeColor: '#9333ea',
  icons: {
    icon: '/favicon.svg',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Entraidance',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${nunito.variable} ${inter.variable} ${marckScript.variable} ${publicSans.variable} antialiased bg-gradient-stitch`}
      >
        <QueryProvider>
          <AuthProvider>
            <SocketProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
              <Toaster />
            </SocketProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
