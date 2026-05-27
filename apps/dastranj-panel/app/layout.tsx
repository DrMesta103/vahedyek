import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { LocatorRuntime } from './components/LocatorRuntime';

const THEME_INIT_SCRIPT =
  "try{var theme=localStorage.getItem('dastranj-theme');if(theme!=='light'&&theme!=='dark'){theme=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';localStorage.setItem('dastranj-theme',theme);}document.documentElement.setAttribute('data-theme',theme);}catch(e){document.documentElement.setAttribute('data-theme',window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');}";

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
        <Script
          id="dastranj-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <LocatorRuntime />
        {children}
      </body>
    </html>
  );
}

