import type { Metadata } from 'next';
import './globals.css';
import { LabThemeProvider } from '@/components/lab/LabThemeProvider';
import { TaavProviders } from '@/components/lab/TaavProviders';

export const metadata: Metadata = {
  title: 'TaavUI Lab',
  description: 'سیستم طراحی داخلی DastRanj و VahedYek',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="dark" suppressHydrationWarning>
      <body>
        <LabThemeProvider>
          <TaavProviders>{children}</TaavProviders>
        </LabThemeProvider>
      </body>
    </html>
  );
}
