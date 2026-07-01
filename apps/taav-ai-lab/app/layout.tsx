import type { Metadata } from 'next';
import { iranSans } from '@/app/lib/fonts';
import { AiLabTooltipProvider } from '@/components/AiLabTooltip';
import { ThemeFloatingToggle } from '@/components/theme/ThemeFloatingToggle';
import { AiLabThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemeInitScript } from '@/components/theme/ThemeInitScript';
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
      className={iranSans.variable}
      suppressHydrationWarning
    >
      <body className={iranSans.className}>
        <AiLabThemeProvider>
          <ThemeInitScript />
          <ThemeFloatingToggle />
          <AiLabTooltipProvider>{children}</AiLabTooltipProvider>
        </AiLabThemeProvider>
      </body>
    </html>
  );
}
