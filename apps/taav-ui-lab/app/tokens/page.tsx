'use client';

import { TAAV_TOKEN_CATALOG, TAAV_TOKEN_SECTIONS } from '@repo/ui/taav/primitives';
import { DocPageHeader, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { TokenPreview } from '@/components/lab/TokenPreview';

export default function TokensPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'توکن‌ها' }]}>
      <DocPageHeader
        eyebrow="Design Tokens"
        title="توکن‌های طراحی"
        description="سیستم توکن TaavUI شامل primitive، semantic و component tokens است. مقادیر در taav-tokens.css تعریف شده و در light/dark تغییر می‌کنند."
        importCode={`import '../../../packages/ui/src/tokens/taav-tokens.css';`}
      />

      {TAAV_TOKEN_SECTIONS.map((section) => {
        const tokens = TAAV_TOKEN_CATALOG.filter((t) => section.categories.includes(t.category));
        if (!tokens.length) return null;

        return (
          <DocSection key={section.id} title={section.titleFa} description={section.title}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tokens.map((token) => (
                <article key={token.name} className="lab-token-card">
                  <TokenPreview token={token} />
                  <div>
                    <code className="lab-code text-[var(--taav-brand-strong)]">{token.cssVar}</code>
                    <h3 className="m-0 mt-1 text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]">
                      {token.name}
                    </h3>
                    <p className="m-0 mt-1 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                      {token.description}
                    </p>
                    <p className="m-0 mt-2 text-[length:var(--taav-text-2xs)] text-[var(--taav-text-subtle)]">
                      {token.themeAware ? 'وابسته به تم' : `مقدار: ${token.value}`}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </DocSection>
        );
      })}
    </DocPageShell>
  );
}
