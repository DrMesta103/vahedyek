import Link from 'next/link';
import type { ReactNode } from 'react';
import { TaavCard } from '@repo/ui/taav/primitives';
import type { DocPropRow } from '@/lib/docs/shared';

export function DocBreadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="lab-breadcrumb" aria-label="مسیر صفحه">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 ? <span aria-hidden>/</span> : null}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-[var(--taav-brand-strong)]">
              {item.label}
            </Link>
          ) : (
            <span className="font-bold text-[var(--taav-text-body)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function DocPageHeader({
  eyebrow,
  title,
  description,
  importCode,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  importCode: string;
}) {
  return (
    <header className="grid gap-[var(--taav-space-4)]">
      {eyebrow ? (
        <span className="text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-brand-strong)]">{eyebrow}</span>
      ) : null}
      <div className="grid gap-[var(--taav-space-2)]">
        <h1 className="m-0 text-[length:var(--taav-text-3xl)] font-black leading-[var(--taav-leading-tight)] text-[var(--taav-text-strong)]">
          {title}
        </h1>
        <p className="m-0 max-w-3xl text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
          {description}
        </p>
      </div>
      <TaavCard variant="soft" padding="sm" radius="md">
        <pre className="lab-code m-0 overflow-x-auto text-[var(--taav-brand-strong)]">{importCode}</pre>
      </TaavCard>
    </header>
  );
}

export function DocSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="lab-doc-section">
      <div className="lab-doc-section-head">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function DocPreview({
  label,
  meta,
  children,
}: {
  label?: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <div className="lab-preview-panel">
      <div className="lab-preview-panel-label">
        <span>{label ?? 'پیش‌نمایش'}</span>
        {meta ? <span className="lab-theme-chip">{meta}</span> : null}
      </div>
      <div className="lab-preview-panel-body">{children}</div>
    </div>
  );
}

export function DocCodeBlock({ children }: { children: string }) {
  return (
    <TaavCard variant="outlined" padding="sm" radius="md">
      <pre className="lab-code m-0 overflow-x-auto text-[var(--taav-text-body)]">{children}</pre>
    </TaavCard>
  );
}

export function DocPropsTable({ rows }: { rows: DocPropRow[] }) {
  return (
    <TaavCard variant="outlined" padding="none" radius="lg">
      <div className="overflow-x-auto">
        <table className="lab-props-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>نوع</th>
              <th>پیش‌فرض</th>
              <th>توضیح</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>
                  <code>{row.name}</code>
                  {row.required ? <span className="mr-1 text-[var(--taav-danger-strong)]">*</span> : null}
                </td>
                <td className="text-[var(--taav-text-muted)]">{row.type}</td>
                <td className="text-[var(--taav-text-subtle)]">{row.defaultValue ?? '—'}</td>
                <td>{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TaavCard>
  );
}

export function DocDoDont({
  doItems,
  dontItems,
}: {
  doItems: string[];
  dontItems: string[];
}) {
  return (
    <div className="grid gap-[var(--taav-space-4)] md:grid-cols-2">
      <TaavCard variant="soft" padding="md" radius="lg">
        <h3 className="m-0 mb-3 text-[length:var(--taav-text-sm)] font-black text-[var(--taav-success-strong)]">
          انجام دهید
        </h3>
        <ul className="m-0 grid list-none gap-2 p-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
          {doItems.map((item) => (
            <li key={item}>✓ {item}</li>
          ))}
        </ul>
      </TaavCard>
      <TaavCard variant="soft" padding="md" radius="lg">
        <h3 className="m-0 mb-3 text-[length:var(--taav-text-sm)] font-black text-[var(--taav-danger-strong)]">
          انجام ندهید
        </h3>
        <ul className="m-0 grid list-none gap-2 p-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
          {dontItems.map((item) => (
            <li key={item}>✕ {item}</li>
          ))}
        </ul>
      </TaavCard>
    </div>
  );
}

export function DocSpecGrid({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}) {
  return (
    <div className="lab-spec-grid">
      {items.map((item) => (
        <div key={item.label} className="lab-spec-item">
          <span className="lab-spec-label">{item.label}</span>
          <span className="lab-spec-value">{item.value}</span>
          {item.hint ? (
            <span className="mt-1 block text-[length:var(--taav-text-2xs)] text-[var(--taav-text-subtle)]">
              {item.hint}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function DocGuidelines({ items }: { items: readonly string[] }) {
  return (
    <TaavCard variant="outlined" padding="md" radius="lg">
      <h3 className="m-0 mb-3 text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]">
        راهنمای استفاده در DastRanj / VahedYek
      </h3>
      <ul className="m-0 grid list-none gap-2 p-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </TaavCard>
  );
}

export function DocApiNote() {
  return (
    <TaavCard variant="soft" padding="md" radius="lg">
      <p className="m-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
        فقط از props رسمی TaavUI استفاده کنید.{' '}
        <code className="lab-code text-[var(--taav-brand-strong)]">unsafeClassName</code> و escape hatchهای مشابه
        فقط برای موارد نادر هستند و نباید در مثال‌های عادی دیده شوند.
      </p>
    </TaavCard>
  );
}
