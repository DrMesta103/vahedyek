import type { Metadata } from 'next';
import './globals.css';
import { LocatorRuntime } from './components/LocatorRuntime';

export const metadata: Metadata = {
  title: 'دسترنج',
  description: 'پنل نکست‌جی‌اس دسترنج با بک‌اند و منطق داده',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" data-theme="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{localStorage.setItem('dastranj-theme','dark');document.documentElement.setAttribute('data-theme','dark')}catch(e){document.documentElement.setAttribute('data-theme','dark')}",
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

