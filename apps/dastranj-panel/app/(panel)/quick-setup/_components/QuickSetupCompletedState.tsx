'use client';

import { ArrowLeft } from 'lucide-react';

type QuickSetupCompletedStateProps = {
  lines: string[];
  manageHref: string;
  manageLabel: string;
  onNext?: () => void;
};

export function QuickSetupCompletedState({ lines, manageHref, manageLabel, onNext }: QuickSetupCompletedStateProps) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, background: 'rgba(14,20,38,0.94)', padding: 16, textAlign: 'right', display: 'grid', gap: 8 }}>
        {lines.map((line) => (
          <div key={line} style={{ color: '#aeb8d9', fontSize: 13 }}>{line}</div>
        ))}
      </div>
      <a
        href={manageHref}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff', padding: '12px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
      >
        {manageLabel}
      </a>
      {onNext ? (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            type="button"
            onClick={onNext}
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ArrowLeft size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
