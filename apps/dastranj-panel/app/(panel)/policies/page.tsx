import Link from 'next/link';
import { ModuleAddTile } from '../../components/module-page/ModuleAddTile';
import { ModulePageHeader } from '../../components/module-page/ModulePageHeader';
import { listPolicies } from '../../lib/data';
import { getPolicyAccess } from '../../lib/policy-access';
import { POLICY_FAMILIES, getPolicyFamilyKey, getPolicySectionValues, getPolicyVariantMeta, type PolicyFamilyKey } from '../../lib/policy-workspaces';
import { PolicyCard } from './_components/PolicyCard';
import { getPolicyHumanSummary } from '../../lib/policy-blueprints';

type PoliciesPageProps = { searchParams?: { q?: string; status?: string; usage?: string } | Promise<{ q?: string; status?: string; usage?: string }> };

function familyLabel(key: PolicyFamilyKey | null) { return key ? POLICY_FAMILIES.find((item) => item.key === key)?.title ?? 'سیاست' : 'سیاست کاری'; }
function calendarLabel(calendar: { yearLabel: string } | null | undefined) { return calendar?.yearLabel?.trim() || 'ثبت نشده'; }
function normalize(value: string) { return value.toLowerCase().replace(/\s+/g, ' ').replace(/[ÙŠÛŒ]/g, 'ÛŒ').replace(/[ÙƒÚ©]/g, 'Ú©').trim(); }

export default async function PoliciesPage({ searchParams }: PoliciesPageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const q = typeof params.q === 'string' ? params.q : '';
  const status = params.status === 'active' || params.status === 'inactive' ? params.status : 'all';
  const usage = params.usage === 'used' || params.usage === 'unused' ? params.usage : 'all';
  const filterHref = (nextStatus: string, nextUsage: string) => {
    const filters = new URLSearchParams();
    if (q) filters.set('q', q);
    if (nextStatus !== 'all') filters.set('status', nextStatus);
    if (nextUsage !== 'all') filters.set('usage', nextUsage);
    const queryString = filters.toString();
    return queryString ? `/policies?${queryString}` : '/policies';
  };
  const [policies, access] = await Promise.all([listPolicies(), getPolicyAccess()]);
  if (!access.canView) return <div className="page-stack module-page" dir="rtl" lang="fa"><div className="module-empty-state"><h2>دسترسی به سیاست‌های کاری ندارید.</h2><p>برای مشاهدهٔ این بخش به نقش مالک، مدیر یا مدیر منابع انسانی نیاز است.</p></div></div>;
  const query = normalize(q);
  const visible = policies.filter((policy) => {
    if (status === 'active' && !policy.isActive) return false;
    if (status === 'inactive' && policy.isActive) return false;
    if (usage === 'used' && policy.groupCount === 0) return false;
    if (usage === 'unused' && policy.groupCount > 0) return false;
    if (!query) return true;
    const key = getPolicyFamilyKey(policy); const values = getPolicySectionValues(policy);
    const variant = key ? getPolicyVariantMeta(key, typeof values.variant === 'string' ? values.variant : null)?.title ?? '' : '';
    return normalize([policy.title, policy.description ?? '', familyLabel(key), variant, calendarLabel(policy.calendar)].join(' ')).includes(query);
  });
  return <div className="page-stack module-page" dir="rtl" lang="fa">
    <ModulePageHeader title="سیاست‌های کاری" subtitle="مدیریت قوانین حضور و غیاب کارکنان" addHref={access.canManage ? '/policies/new' : undefined} addLabel="افزودن سیاست" />
    <div className="module-page-toolbar"><details className="policy-filter-menu"><summary aria-label="نمایش فیلترها">⚱</summary><div className="policy-filter-menu-body"><div className="policy-filter-tags"><span className="policy-filter-tags-label">وضعیت سیاست</span><Link href={filterHref(status === 'active' ? 'all' : 'active', usage)} className={`policy-filter-tag ${status === 'active' ? 'is-active' : ''}`}>سیاست‌های فعال</Link><Link href={filterHref(status === 'inactive' ? 'all' : 'inactive', usage)} className={`policy-filter-tag ${status === 'inactive' ? 'is-active' : ''}`}>سیاست‌های غیرفعال</Link></div><div className="policy-filter-tags"><span className="policy-filter-tags-label">میزان استفاده</span><Link href={filterHref(status, usage === 'used' ? 'all' : 'used')} className={`policy-filter-tag ${usage === 'used' ? 'is-active' : ''}`}>سیاست‌های استفاده‌شده</Link><Link href={filterHref(status, usage === 'unused' ? 'all' : 'unused')} className={`policy-filter-tag ${usage === 'unused' ? 'is-active' : ''}`}>سیاست‌های بدون استفاده</Link></div></div></details><form action="/policies" method="get" className="module-year-filter">
      <input type="search" name="q" defaultValue={q} aria-label="جست‌وجوی سیاست" placeholder="جست‌وجوی سیاست..." />
      <select name="status" defaultValue={status} aria-label="فیلتر وضعیت"><option value="all">همه وضعیت‌ها</option><option value="active">فعال</option><option value="inactive">غیرفعال</option></select>
      <select name="usage" defaultValue={usage} aria-label="فیلتر استفاده"><option value="all">همه استفاده‌ها</option><option value="used">استفاده‌شده</option><option value="unused">بدون استفاده</option></select>
    </form><div className="policy-filter-tags" aria-label="فیلتر وضعیت سیاست"><span className="policy-filter-tags-label">وضعیت سیاست</span>{[['active', 'سیاست‌های فعال'], ['inactive', 'سیاست‌های غیرفعال']].map(([value, label]) => <Link key={value} title={`${status === value ? 'لغو فیلتر' : 'اعمال فیلتر'}: ${label}`} href={filterHref(status === value ? 'all' : value, usage)} className={`policy-filter-tag ${status === value ? 'is-active' : ''}`}>{label}</Link>)}</div><div className="policy-filter-tags" aria-label="فیلتر میزان استفاده"><span className="policy-filter-tags-label">میزان استفاده</span>{[['used', 'سیاست‌های استفاده‌شده'], ['unused', 'سیاست‌های بدون استفاده']].map(([value, label]) => <Link key={value} title={`${usage === value ? 'لغو فیلتر' : 'اعمال فیلتر'}: ${label}`} href={filterHref(status, usage === value ? 'all' : value)} className={`policy-filter-tag ${usage === value ? 'is-active' : ''}`}>{label}</Link>)}</div></div>
    <div className="module-page-grid">
      {visible.map((policy) => { const key = getPolicyFamilyKey(policy); const values = getPolicySectionValues(policy); const variant = typeof values.variant === 'string' ? values.variant : null; const editHref = key ? `/policies/${key}?policyId=${policy.id}` : `/policies/work?policyId=${policy.id}`; return <PolicyCard key={policy.id} editHref={editHref} viewHref={`/policies/work?policyId=${policy.id}&mode=view`} item={{ id: policy.id, title: policy.title, description: policy.description, calendarLabel: calendarLabel(policy.calendar), familyLabel: familyLabel(key), variantLabel: key ? getPolicyVariantMeta(key, variant)?.title ?? 'پیش‌فرض' : 'پیش‌فرض', isActive: policy.isActive, groupCount: policy.groupCount, employeeCount: policy.employeeCount, summary: getPolicyHumanSummary(values), connectedGroups: policy.workGroups.map((group) => ({ id: group.id, title: group.title, memberCount: group.members.length })) }} />; })}
      {!visible.length ? <div className="module-empty-state"><h2>سیاستی مطابق فیلترها پیدا نشد.</h2><p>فیلترها را تغییر دهید یا یک سیاست کاری جدید ایجاد کنید.</p></div> : null}
      {access.canManage ? <ModuleAddTile href="/policies/new" label="برای افزودن سیاست کاری کلیک کنید." /> : null}
    </div>
  </div>;
}
