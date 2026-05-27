import type { Metadata } from 'next';
import './globals.css';
import { LocatorRuntime } from './components/LocatorRuntime';
import { ThemeInitScript } from './components/theme/ThemeInitScript';

export const metadata: Metadata = {
  title: 'دسترنج',
  description: 'پنل نکست‌جی‌اس دسترنج با بک‌اند و منطق داده',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <ThemeInitScript />
        <LocatorRuntime />
        {children}
      </body>
    </html>
  );
}

