import type { Metadata } from 'next';
import './globals.css';
import { LocatorRuntime } from './components/LocatorRuntime';

export const metadata: Metadata = {
  title: 'دسترنج',
  description: 'پنل نکست‌جی‌اس دسترنج با بک‌اند و منطق داده',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var theme=localStorage.getItem('dastranj-theme');if(theme!=='light'&&theme!=='dark'){theme=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';localStorage.setItem('dastranj-theme',theme);}document.documentElement.setAttribute('data-theme',theme);}catch(e){document.documentElement.setAttribute('data-theme',window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');}",
          }}
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <LocatorRuntime />
        {children}
      </body>
    </html>
  );
}

