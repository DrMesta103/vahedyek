import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'آزمایشگاه هوش مصنوعی تاو',
  description: 'محیط کنترل‌شده برای تست قابلیت‌های هوش مصنوعی پیش از ورود به محصول.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      data-theme="dark"
      data-taav-theme="dark"
      className="dark"
      style={{ colorScheme: 'dark' }}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
