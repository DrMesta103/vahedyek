import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { currentAppConfig } from './config/current';
import AuditActivityTracker from './components/AuditActivityTracker';
import { AppToastProvider } from './components/feedback/AppToastProvider';
import { ThemeInitScript } from './components/theme/ThemeInitScript';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { LocatorRuntime } from './components/LocatorRuntime';

export const metadata: Metadata = {
  title: currentAppConfig.appName,
  description: 'پنل چند tenant فارسی',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <LocatorRuntime />
        <Suspense fallback={null}>
          <AuditActivityTracker />
        </Suspense>
        <ThemeProvider>
          <AppToastProvider>{children}</AppToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
