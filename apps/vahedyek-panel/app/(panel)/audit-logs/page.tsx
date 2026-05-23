'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toGregorian } from 'jalaali-js';
import type { LucideIcon } from 'lucide-react';
import {
  Blocks,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Filter,
  LogIn,
  LogOut,
  PencilLine,
  Search,
  Send,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
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

type VisualTone = 'teal' | 'green' | 'blue' | 'violet' | 'amber' | 'slate';

const ACTION_LABELS: Record<string, string> = {
  'auth.login': 'ورود به سامانه',
  'auth.logout': 'خروج از سامانه',
  'auth.select_tenant': 'انتخاب کسب و کار',
  'tenant.create': 'ساخت کسب و کار',
  'contract.create': 'ساخت قرارداد',
  'contract.subject.update': 'ویرایش اطلاعات پایه قرارداد',
  'contract.financial.update': 'ویرایش مالی قرارداد',
  'contract.parties.update': 'ویرایش طرفین قرارداد',
  'contract.penalties.update': 'ویرایش جرایم قرارداد',
  'contract.termination.update': 'ویرایش شرایط فسخ قرارداد',
  'contract.approval.submit': 'ارسال قرارداد برای تایید',
  'contract.approval.decision': 'ثبت تصمیم تایید قرارداد',
  'employee.create': 'ثبت کارمند',
  'employee.update': 'ویرایش کارمند',
  'employee.delete': 'غیرفعال سازی کارمند',
  'access.role.create': 'ساخت نقش',
  'access.role.update': 'ویرایش دسترسی نقش',
  'access.member.update': 'ویرایش نقش کاربر',
  'project.block.create': 'ثبت بلوک',
  'project.block.update': 'ویرایش بلوک',
  'project.block.delete': 'حذف بلوک',
  'page.view': 'بازدید صفحه',
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
  page: 'صفحه',
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
  if (!value || (typeof value === 'object' && Object.keys(value as Record<string, unknown>).length === 0)) {
    return 'جزئیاتی ثبت نشده است.';
  }
  return JSON.stringify(value, null, 2);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function getPageLogHref(log: AuditLog) {
  if (log.action !== 'page.view') return null;
  const path = log.entityId?.startsWith('/') ? log.entityId : null;
  if (!path) return null;

  const details = asRecord(log.details);
  const search = typeof details.search === 'string' && details.search.startsWith('?') ? details.search : '';
  return `${path}${search}`;
}

function getPageLogTitle(log: AuditLog) {
  return log.entityLabel || log.entityId || 'صفحه';
}

function getLogPageContext(log: AuditLog) {
  const metadata = asRecord(log.metadata);
  const pageContext = asRecord(metadata.pageContext);
  const path = typeof pageContext.path === 'string' && pageContext.path.startsWith('/') ? pageContext.path : null;
  if (!path) return null;

  const search = typeof pageContext.search === 'string' && pageContext.search.startsWith('?') ? pageContext.search : '';
  const title = typeof pageContext.title === 'string' && pageContext.title.trim() ? pageContext.title : path;
  return {
    href: `${path}${search}`,
    title,
  };
}

function getLogActionLabel(log: AuditLog) {
  if (log.action === 'page.view') return `بازدید صفحه ${getPageLogTitle(log)}`;
  return ACTION_LABELS[log.action] ?? log.summary ?? log.action;
}

function getActionVisual(action: string): { icon: LucideIcon; tone: VisualTone } {
  if (action === 'page.view') return { icon: Eye, tone: 'blue' };
  if (action.includes('login')) return { icon: LogIn, tone: 'green' };
  if (action.includes('logout')) return { icon: LogOut, tone: 'slate' };
  if (action.includes('approval.decision')) return { icon: CheckCircle2, tone: 'green' };
  if (action.includes('approval.submit')) return { icon: Send, tone: 'blue' };
  if (action.includes('employee.create')) return { icon: UserPlus, tone: 'green' };
  if (action.includes('access.')) return { icon: ShieldCheck, tone: 'violet' };
  if (action.includes('project.block')) return { icon: Blocks, tone: 'amber' };
  if (action.includes('create')) return { icon: FileText, tone: 'teal' };
  if (action.includes('update') || action.includes('edit')) return { icon: PencilLine, tone: 'violet' };
  return { icon: Building2, tone: 'teal' };
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '؟';
  return words.slice(0, 2).map((word) => word[0]).join('');
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
        setData({
          ...payload,
          logs: payload.logs.filter((log) => log.action !== 'api.get'),
          filters: {
            ...payload.filters,
            actions: payload.filters.actions.filter((action) => action !== 'api.get'),
            entityTypes: payload.filters.entityTypes.filter((entityType) => entityType !== 'api_request'),
          },
        });
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

  const total = data?.pagination.total ?? 0;
  const pageCount = data?.pagination.pageCount ?? 1;
  const detailsPageContext = detailsLog ? getLogPageContext(detailsLog) : null;

  return (
    <PanelLayout>
      <section className="audit-page">
        <div className="audit-hero audit-hero-list">
          <div className="audit-hero-copy">
            <div className="audit-hero-icon" aria-hidden="true">
              <FileText size={28} />
            </div>
            <div>
              <span className="audit-kicker">گزارش فعالیت سیستم</span>
              <h1>فهرست لاگ‌های سیستم</h1>
              <p>در این بخش می‌توانید تمام رویدادها و تغییرات ثبت‌شده در سیستم را با ظاهر خواناتر و جزئیات کامل مشاهده کنید.</p>
            </div>
          </div>
          <div className="audit-stat-card">
            <span>کل لاگ‌ها</span>
            <strong>{new Intl.NumberFormat('fa-IR').format(total)}</strong>
          </div>
        </div>

        <div className="audit-filters audit-filters-fa">
          <button type="button" className="audit-filter-tile" onClick={clearFilters}>
            <Filter size={18} />
            <span>فیلترها</span>
          </button>

          <label className="audit-filter-search">
            <span>جستجو</span>
            <div className="audit-input-shell">
              <Search size={18} />
              <input value={filters.q} onChange={(event) => updateFilter('q', event.target.value)} placeholder="نام کاربر، عنوان اکشن یا توضیح" />
            </div>
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
        </div>

        {error ? <div className="audit-error">{error}</div> : null}

        <div className="audit-table-card">
          <div className="audit-table-head">
            <span>کاربر</span>
            <span>اکشن</span>
            <span>تاریخ</span>
            <span>توضیحات</span>
            <span>جزئیات</span>
          </div>

          {loading ? <div className="audit-empty">در حال دریافت لاگ‌ها...</div> : null}
          {!loading && !data?.logs.length ? <div className="audit-empty">لاگی با این فیلترها پیدا نشد.</div> : null}

          {data?.logs.map((log) => {
            const actionVisual = getActionVisual(log.action);
            const ActionIcon = actionVisual.icon;
            const pageHref = getPageLogHref(log);
            const pageTitle = getPageLogTitle(log);

            return (
              <article key={log.id} className="audit-list-row">
                <div className="audit-user-cell">
                  <div className="audit-user-avatar">{getInitials(log.actorName)}</div>
                  <div className="audit-user-copy">
                    <strong>{log.actorName}</strong>
                  </div>
                </div>

                <div className="audit-action-cell">
                  <div className={`audit-tone-badge is-${actionVisual.tone}`}>
                    <ActionIcon size={18} />
                  </div>
                  <strong>{getLogActionLabel(log)}</strong>
                </div>

                <div className="audit-date-cell">
                  <CalendarDays size={16} />
                  <div>
                    <strong>{formatDateFa(log.createdAt)}</strong>
                    <span>{formatDateFa(log.createdAt, { withTime: true }).split(' - ').slice(-1)[0]}</span>
                  </div>
                </div>

                <div className="audit-row-title">
                  <span>توضیحات</span>
                  {pageHref ? (
                    <p>
                      <Link href={pageHref} className="audit-page-link">
                        {pageTitle}
                      </Link>
                    </p>
                  ) : (
                    <p>{log.summary}</p>
                  )}
                </div>

                <button type="button" className="audit-detail-button is-icon" onClick={() => setDetailsLog(log)} aria-label="نمایش جزئیات">
                  <Eye size={15} />
                </button>
              </article>
            );
          })}

          {data ? (
            <div className="audit-pagination">
              <div className="audit-pagination-status">
                <span>از {new Intl.NumberFormat('fa-IR').format(total)} مورد</span>
              </div>
              <div className="audit-pagination-controls">
                <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)} aria-label="صفحه بعد">
                  <ChevronRight size={16} />
                </button>
                <span className="audit-pagination-chip">{new Intl.NumberFormat('fa-IR').format(page)}</span>
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="صفحه قبل">
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {detailsLog ? (
          <div className="audit-dialog-backdrop" role="dialog" aria-modal="true" onClick={() => setDetailsLog(null)}>
            <div className="audit-dialog" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="audit-dialog-close" onClick={() => setDetailsLog(null)} aria-label="بستن">
                ×
              </button>

              <div className="audit-dialog-header">
                <div className={`audit-tone-badge is-${getActionVisual(detailsLog.action).tone}`}>
                  {(() => {
                    const Icon = getActionVisual(detailsLog.action).icon;
                    return <Icon size={20} />;
                  })()}
                </div>
                <div>
                  <span className="audit-kicker">{getLogActionLabel(detailsLog)}</span>
                  <h2>{detailsLog.summary}</h2>
                </div>
              </div>

              <div className="audit-dialog-meta">
                <div>
                  <span>کاربر</span>
                  <strong>{detailsLog.actorName}</strong>
                </div>
                <div>
                  <span>اکشن</span>
                  <strong>{getLogActionLabel(detailsLog)}</strong>
                </div>
                <div>
                  <span>تاریخ</span>
                  <strong>{formatDateFa(detailsLog.createdAt, { withTime: true })}</strong>
                </div>
                <div>
                  <span>موجودیت</span>
                  <strong>{detailsLog.entityLabel || detailsLog.entityId || ENTITY_LABELS[detailsLog.entityType] || detailsLog.entityType}</strong>
                </div>
                {detailsPageContext ? (
                  <div>
                    <span>صفحه انجام عملیات</span>
                    <strong>
                      <Link href={detailsPageContext.href} className="audit-page-link">
                        {detailsPageContext.title}
                      </Link>
                    </strong>
                  </div>
                ) : null}
                <div>
                  <span>IP</span>
                  <strong>{detailsLog.ipAddress ?? 'ثبت نشده'}</strong>
                </div>
                <div>
                  <span>عامل کاربری</span>
                  <strong>{detailsLog.userAgent ?? 'ثبت نشده'}</strong>
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
                  <p>برای این اکشن تغییری در سطح فیلد ثبت نشده است.</p>
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
