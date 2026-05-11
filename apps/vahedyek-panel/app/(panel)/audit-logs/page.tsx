'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toGregorian } from 'jalaali-js';
import { PersianDatePicker } from '@repo/ui';
import PanelLayout from '../../components/PanelLayout';
import { formatDateFa } from '../../lib/dateFormat';

type AuditDiff = {
  field: string;
  label: string;
  before: string;
  after: string;
  beforeMeta?: string;
  afterMeta?: string;
};

type AuditLog = {
  id: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string | null;
  entityLabel: string | null;
  summary: string;
  diff: AuditDiff[] | unknown;
  details: unknown;
  metadata: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

type AuditResponse = {
  logs: AuditLog[];
  pagination: { page: number; pageSize: number; total: number; pageCount: number };
  filters: {
    actors: Array<{ id: string; name: string }>;
    actions: string[];
    entityTypes: string[];
  };
};

const ACTION_LABELS: Record<string, string> = {
  'auth.login': 'ورود به سامانه',
  'auth.logout': 'خروج از سامانه',
  'auth.select_tenant': 'انتخاب کسب و کار',
  'tenant.create': 'ساخت کسب و کار',
  'contract.create': 'ساخت قرارداد',
  'contract.subject.update': 'ویرایش اطلاعات پایه قرارداد',
  'contract.financial.update': 'ویرایش مالی قرارداد',
  'contract.parties.update': 'ویرایش طرفین قرارداد',
  'contract.penalties.update': 'ویرایش جرائم قرارداد',
  'contract.termination.update': 'ویرایش شرایط فسخ قرارداد',
  'contract.approval.submit': 'ارسال قرارداد برای تایید',
  'contract.approval.decision': 'ثبت تصمیم تایید قرارداد',
  'employee.create': 'ثبت کارمند',
  'employee.update': 'ویرایش کارمند',
  'employee.delete': 'غیرفعال‌سازی کارمند',
  'access.role.create': 'ساخت نقش',
  'access.role.update': 'ویرایش دسترسی نقش',
  'access.member.update': 'ویرایش نقش کاربر',
  'project.block.create': 'ثبت بلوک',
  'project.block.update': 'ویرایش بلوک',
  'project.block.delete': 'حذف بلوک',
};

const ENTITY_LABELS: Record<string, string> = {
  auth: 'احراز هویت',
  tenant: 'کسب و کار',
  user: 'کاربر',
  contract_draft: 'قرارداد',
  employee: 'کارمند',
  tenant_role: 'نقش',
  membership: 'عضویت کاربر',
  block: 'بلوک',
};

function asDiff(value: AuditLog['diff']): AuditDiff[] {
  return Array.isArray(value) ? (value as AuditDiff[]) : [];
}

function jalaliToIso(value: string) {
  const match = value.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return value;
  const gregorian = toGregorian(Number(match[1]), Number(match[2]), Number(match[3]));
  return `${gregorian.gy}-${String(gregorian.gm).padStart(2, '0')}-${String(gregorian.gd).padStart(2, '0')}`;
}

function toJsonPreview(value: unknown) {
  if (!value || (typeof value === 'object' && Object.keys(value as Record<string, unknown>).length === 0)) return 'جزئیاتی ثبت نشده است.';
  return JSON.stringify(value, null, 2);
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [data, setData] = useState<AuditResponse | null>(null);
  const [detailsLog, setDetailsLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    q: '',
    actorUserId: '',
    action: '',
    entityType: '',
    dateFrom: '',
    dateTo: '',
  });

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', '25');
    if (filters.q.trim()) params.set('q', filters.q.trim());
    if (filters.actorUserId) params.set('actorUserId', filters.actorUserId);
    if (filters.action) params.set('action', filters.action);
    if (filters.entityType) params.set('entityType', filters.entityType);
    if (filters.dateFrom) params.set('dateFrom', jalaliToIso(filters.dateFrom));
    if (filters.dateTo) params.set('dateTo', jalaliToIso(filters.dateTo));
    return params.toString();
  }, [filters, page]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/audit-logs?${query}`)
      .then(async (response) => {
        if (response.status === 401) {
          router.push(`/login?next=${encodeURIComponent('/audit-logs')}`);
          return null;
        }
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.message ?? 'خطا در دریافت لاگ‌ها');
        return payload as AuditResponse;
      })
      .then((payload) => {
        if (!mounted || !payload) return;
        setData(payload);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'خطا در دریافت لاگ‌ها');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [query, router]);

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setPage(1);
    setFilters({ q: '', actorUserId: '', action: '', entityType: '', dateFrom: '', dateTo: '' });
  };

  return (
    <PanelLayout>
      <section className="audit-page">
        <div className="audit-hero audit-hero-list">
          <div>
            <span className="audit-kicker">گزارش فعالیت‌ها</span>
            <h1>فهرست لاگ‌های سیستم</h1>
            <p>هر ردیف نشان می‌دهد چه کاربری، چه اکشنی، در چه تاریخی انجام داده است. جزئیات تغییرات از دکمه «جزئیات» باز می‌شود.</p>
          </div>
          <div className="audit-stat-card">
            <span>کل لاگ‌ها</span>
            <strong>{new Intl.NumberFormat('fa-IR').format(data?.pagination.total ?? 0)}</strong>
          </div>
        </div>

        <div className="audit-filters audit-filters-fa">
          <label>
            <span>جستجو</span>
            <input value={filters.q} onChange={(event) => updateFilter('q', event.target.value)} placeholder="نام کاربر، عنوان اکشن یا توضیح" />
          </label>
          <label>
            <span>کاربر</span>
            <select value={filters.actorUserId} onChange={(event) => updateFilter('actorUserId', event.target.value)}>
              <option value="">همه کاربران</option>
              {data?.filters.actors.map((actor) => (
                <option key={actor.id} value={actor.id}>
                  {actor.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>اکشن</span>
            <select value={filters.action} onChange={(event) => updateFilter('action', event.target.value)}>
              <option value="">همه اکشن‌ها</option>
              {data?.filters.actions.map((action) => (
                <option key={action} value={action}>
                  {ACTION_LABELS[action] ?? action}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>موجودیت</span>
            <select value={filters.entityType} onChange={(event) => updateFilter('entityType', event.target.value)}>
              <option value="">همه موجودیت‌ها</option>
              {data?.filters.entityTypes.map((entityType) => (
                <option key={entityType} value={entityType}>
                  {ENTITY_LABELS[entityType] ?? entityType}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>از تاریخ</span>
            <PersianDatePicker value={filters.dateFrom} onChange={(value) => updateFilter('dateFrom', value)} placeholder="انتخاب تاریخ شروع" />
          </label>
          <label>
            <span>تا تاریخ</span>
            <PersianDatePicker value={filters.dateTo} onChange={(value) => updateFilter('dateTo', value)} placeholder="انتخاب تاریخ پایان" />
          </label>
          <button type="button" className="audit-clear-button" onClick={clearFilters}>
            پاک کردن فیلترها
          </button>
        </div>

        {error ? <div className="audit-error">{error}</div> : null}

        <div className="audit-table-card">
          <div className="audit-table-head">
            <span>نام</span>
            <span>اکشن</span>
            <span>موجودیت</span>
            <span>تاریخ</span>
            <span>عنوان</span>
            <span>جزئیات</span>
          </div>

          {loading ? <div className="audit-empty">در حال دریافت لاگ‌ها...</div> : null}
          {!loading && !data?.logs.length ? <div className="audit-empty">لاگی با این فیلترها پیدا نشد.</div> : null}

          {data?.logs.map((log) => (
            <article key={log.id} className="audit-list-row">
              <div className="audit-field">
                <span>نام :</span>
                <strong>{log.actorName}</strong>
              </div>
              <div className="audit-field">
                <span>اکشن :</span>
                <strong>{ACTION_LABELS[log.action] ?? log.action}</strong>
              </div>
              <div className="audit-field">
                <span>موجودیت :</span>
                <strong>{log.entityLabel || ENTITY_LABELS[log.entityType] || log.entityType}</strong>
              </div>
              <div className="audit-field">
                <span>تاریخ :</span>
                <strong>{formatDateFa(log.createdAt, { withTime: true })}</strong>
              </div>
              <div className="audit-row-title">
                <span>عنوان :</span>
                <p>{log.summary}</p>
              </div>
              <button type="button" className="audit-detail-button" onClick={() => setDetailsLog(log)}>
                جزئیات
              </button>
            </article>
          ))}

          {data ? (
            <div className="audit-pagination">
              <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                قبلی
              </button>
              <span>
                صفحه {new Intl.NumberFormat('fa-IR').format(data.pagination.page)} از {new Intl.NumberFormat('fa-IR').format(data.pagination.pageCount)}
              </span>
              <button type="button" disabled={page >= data.pagination.pageCount} onClick={() => setPage((current) => current + 1)}>
                بعدی
              </button>
            </div>
          ) : null}
        </div>

        {detailsLog ? (
          <div className="audit-dialog-backdrop" role="dialog" aria-modal="true" onClick={() => setDetailsLog(null)}>
            <div className="audit-dialog" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="audit-dialog-close" onClick={() => setDetailsLog(null)} aria-label="بستن">
                ×
              </button>
              <span className="audit-kicker">{ACTION_LABELS[detailsLog.action] ?? detailsLog.action}</span>
              <h2>{detailsLog.summary}</h2>

              <div className="audit-dialog-meta">
                <div>
                  <span>نام :</span>
                  <strong>{detailsLog.actorName}</strong>
                </div>
                <div>
                  <span>اکشن :</span>
                  <strong>{ACTION_LABELS[detailsLog.action] ?? detailsLog.action}</strong>
                </div>
                <div>
                  <span>تاریخ :</span>
                  <strong>{formatDateFa(detailsLog.createdAt, { withTime: true })}</strong>
                </div>
                <div>
                  <span>موجودیت :</span>
                  <strong>{detailsLog.entityLabel || detailsLog.entityId || ENTITY_LABELS[detailsLog.entityType] || detailsLog.entityType}</strong>
                </div>
                <div>
                  <span>IP :</span>
                  <strong>{detailsLog.ipAddress ?? 'ثبت نشده'}</strong>
                </div>
              </div>

              <div className="audit-diff-list">
                <h3>جزئیات تغییرات</h3>
                {asDiff(detailsLog.diff).length ? (
                  asDiff(detailsLog.diff).map((item) => (
                    <div key={`${item.field}-${item.label}`} className="audit-diff-item">
                      <strong>{item.label}</strong>
                      <span className="audit-diff-change">
                        <span>
                          از <b>{item.before}</b>
                          {item.beforeMeta ? <small>{item.beforeMeta}</small> : null}
                        </span>
                        <i>به</i>
                        <span>
                          <b>{item.after}</b>
                          {item.afterMeta ? <small>{item.afterMeta}</small> : null}
                        </span>
                      </span>
                    </div>
                  ))
                ) : (
                  <p>برای این اکشن تغییر فیلدی ثبت نشده است.</p>
                )}
              </div>

              <details className="audit-json-details">
                <summary>نمایش داده خام</summary>
                <pre>{toJsonPreview(detailsLog.details)}</pre>
              </details>
            </div>
          </div>
        ) : null}
      </section>
    </PanelLayout>
  );
}
