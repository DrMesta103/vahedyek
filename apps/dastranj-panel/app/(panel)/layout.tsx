import type { ReactNode } from 'react';
import { PanelShell } from '../components/PanelShell';

export const dynamic = 'force-dynamic';

export default function PanelLayout({ children }: { children: ReactNode }) {
  return <PanelShell>{children}</PanelShell>;
}
