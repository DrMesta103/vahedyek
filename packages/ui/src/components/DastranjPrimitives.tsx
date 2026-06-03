import Link from 'next/link';
import type { ReactNode } from 'react';

export function PageIntro({
  title,
  description,
  action,
  badge,
  aside,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  badge?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="page-intro overflow-hidden rounded-[30px] border border-[color:var(--border-color)] bg-[linear-gradient(135deg,rgba(8,17,31,0.96),rgba(14,26,43,0.9))] p-6 shadow-[0_18px_50px_var(--shadow-soft)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="grid gap-5 lg:max-w-[min(100%,720px)]">
          {badge ? (
            <div className="flex items-center justify-start">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-bold text-white/90">
                {badge}
              </div>
            </div>
          ) : null}
          <div className="grid gap-3">
            <h2 className="text-[28px] font-black leading-tight text-white sm:text-[34px]">{title}</h2>
            <p className="max-w-3xl text-sm leading-8 text-white/72">{description}</p>
          </div>
          {action ? <div className="flex flex-wrap items-center gap-3">{action}</div> : null}
        </div>
        {aside ? (
          <div className="lg:min-w-[280px] lg:max-w-[320px]">{aside}</div>
        ) : null}
      </div>
    </section>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="primary-link">
      {children}
    </Link>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function StatGrid({ items }: { items: Array<{ label: string; value: string | number }> }) {
  return (
    <div className="stat-grid">
      {items.map((item) => (
        <article key={item.label} className="stat-card">
          <span>{item.label}</span>
          <strong>{typeof item.value === 'number' ? new Intl.NumberFormat('fa-IR').format(item.value) : item.value}</strong>
        </article>
      ))}
    </div>
  );
}

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FormCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="form-card">
      <div className="form-card-header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
