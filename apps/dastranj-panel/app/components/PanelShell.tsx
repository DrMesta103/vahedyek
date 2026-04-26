import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

export function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div className="panel-shell">
      <Sidebar />
      <main className="panel-main">
        <div className="panel-topbar">
          <div>
            <p className="eyebrow">دسترنج</p>
            <h1 className="topbar-title">پنل مدیریت کسب و کار</h1>
          </div>
          <div className="topbar-badge">Next App Router</div>
        </div>
        {children}
      </main>
    </div>
  );
}
