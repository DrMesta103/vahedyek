import type { Metadata } from 'next';
import './globals.css';
import { currentAppConfig } from './config/current';
import { ThemeInitScript } from './components/theme/ThemeInitScript';
import { ThemeProvider } from './components/theme/ThemeProvider';

export const metadata: Metadata = {
  title: currentAppConfig.appName,
  description: 'پنل چند tenant فارسی',
};

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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
