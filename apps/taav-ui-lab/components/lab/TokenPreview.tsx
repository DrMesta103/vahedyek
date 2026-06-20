'use client';

import type { TokenEntry } from '@repo/ui/taav/primitives';

export function TokenPreview({ token }: { token: TokenEntry }) {
  if (token.preview === 'color') {
    return (
      <div
        className="lab-token-preview"
        style={{ background: `var(${token.cssVar})` }}
        title={token.cssVar}
      />
    );
  }

  if (token.preview === 'radius') {
    return (
      <div
        className="lab-token-preview bg-[var(--taav-brand-muted)]"
        style={{ borderRadius: `var(${token.cssVar})` }}
      />
    );
  }

  if (token.preview === 'shadow') {
    return (
      <div className="lab-token-preview bg-[var(--taav-surface)]" style={{ boxShadow: `var(${token.cssVar})` }} />
    );
  }

  if (token.preview === 'spacing') {
    return (
      <div className="lab-token-preview flex items-center bg-[var(--taav-surface-soft)] px-3">
        <div className="h-3 rounded-[var(--taav-radius-sm)] bg-[var(--taav-brand)]" style={{ width: `var(${token.cssVar})` }} />
      </div>
    );
  }

  if (token.preview === 'text') {
    return (
      <div
        className="lab-token-preview flex items-center bg-[var(--taav-surface-soft)] px-3 font-bold text-[var(--taav-text-strong)]"
        style={{ fontSize: `var(${token.cssVar})` }}
      >
        نمونه متن
      </div>
    );
  }

  return <div className="lab-token-preview bg-[var(--taav-surface-muted)]" />;
}
