import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'دسترنج',
  description: 'پنل نکست‌جی‌اس دسترنج با بک‌اند و منطق داده',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}

