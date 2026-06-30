'use client';

import type { ReactNode } from 'react';
import { AdminGateProvider } from '@/components/settings/AdminGateProvider';

export function SettingsClientShell({ children }: { children: ReactNode }) {
  return <AdminGateProvider>{children}</AdminGateProvider>;
}
