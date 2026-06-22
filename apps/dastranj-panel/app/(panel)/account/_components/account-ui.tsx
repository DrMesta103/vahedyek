'use client';

import { useId, type ReactNode } from 'react';

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <article className="profile-summary-card">
      <div className="dashboard-spotlight-head">
        <div>
          <p className="eyebrow">{title}</p>
          {description ? <p className="mt-2 text-[13px] leading-7 text-[color:var(--muted)]">{description}</p> : null}
        </div>
      </div>
      {children}
    </article>
  );
}

export function Field({
  label,
  children,
  hint,
  fullSpan,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  fullSpan?: boolean;
}) {
  return (
    <label className={fullSpan ? 'full-span' : undefined}>
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function OwnerSummary({
  fullName,
  mobile,
  brandCode,
  accountCount,
}: {
  fullName: string;
  mobile: string;
  brandCode: string;
  accountCount: number;
}) {
  return (
    <div className="detail-grid">
      <div>
        <span>مالک tenant</span>
        <strong>{fullName || 'ثبت نشده'}</strong>
      </div>
      <div>
        <span>شماره موبایل</span>
        <strong>{mobile || 'ثبت نشده'}</strong>
      </div>
      <div>
        <span>کد برند</span>
        <strong>{brandCode || 'DS'}</strong>
      </div>
      <div>
        <span>تعداد حساب بانکی</span>
        <strong>{accountCount}</strong>
      </div>
    </div>
  );
}

export function UploadCard({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: string;
  onChange: (file: File | null) => void;
}) {
  const inputId = useId();

  return (
    <label className="profile-summary-card cursor-pointer" htmlFor={inputId} style={{ minHeight: 260 }}>
      <div className="dashboard-spotlight-head">
        <div>
          <p className="eyebrow">{title}</p>
          <p className="mt-2 text-[13px] leading-7 text-[color:var(--muted)]">{description}</p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: 140,
          borderRadius: 18,
          border: '1px dashed var(--line)',
          background: 'rgba(255,255,255,0.03)',
          overflow: 'hidden',
        }}
      >
        {value ? (
          <img
            src={value}
            alt={title}
            style={{ width: '100%', height: 140, objectFit: 'contain', padding: 12 }}
          />
        ) : (
          <span className="muted">هنوز فایلی ثبت نشده است</span>
        )}
      </div>

      <input
        id={inputId}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </label>
  );
}

export function LoadingCard({ label = 'در حال بارگذاری...' }: { label?: string }) {
  return <div className="profile-summary-card">{label}</div>;
}
