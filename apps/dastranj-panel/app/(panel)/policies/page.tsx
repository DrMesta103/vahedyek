import Link from 'next/link';
import { BriefcaseBusiness, Plus, Search } from 'lucide-react';
import { CardMenu } from '../../components/CardMenu';
import { deletePolicyAction } from '../../lib/actions';
import { listPolicies } from '../../lib/data';
import {
  POLICY_FAMILIES,
  getPolicyFamilyKey,
  getPolicySectionValues,
  getPolicyVariantMeta,
  type PolicyFamilyKey,
} from '../../lib/policy-workspaces';
import { PolicyPageShell } from './_components/PolicyWorkspaceShell';

type PoliciesPageProps = {
  searchParams?: { q?: string } | Promise<{ q?: string }>;
};

function resolveFamilyLabel(familyKey: PolicyFamilyKey | null) {
  if (!familyKey) return 'سیاست کاری';
  return POLICY_FAMILIES.find((item) => item.key === familyKey)?.title ?? 'سیاست';
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('fa-IR');
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[يی]/g, 'ی')
    .replace(/[كک]/g, 'ک')
    .trim();
}

export default async function PoliciesPage({ searchParams }: PoliciesPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';
  const query = normalize(q);
  const policies = await listPolicies();

  const filteredPolicies = query
    ? policies.filter((policy) => {
        const familyKey = getPolicyFamilyKey(policy);
        const sectionValues = getPolicySectionValues(policy);
        const variantKey = typeof sectionValues.variant === 'string' ? sectionValues.variant : null;
        const familyTitle = resolveFamilyLabel(familyKey);
        const variantTitle = familyKey ? getPolicyVariantMeta(familyKey, variantKey)?.title ?? '' : '';
        const haystack = normalize([policy.title, policy.description ?? '', familyTitle, variantTitle, policy.calendar?.title ?? ''].join(' '));
        return haystack.includes(query);
      })
    : policies;

  return (
    <PolicyPageShell
      title="سیاست‌های کاری"
      subtitle="مدیریت قوانین و سیاست‌های حضور و غیاب کارمندان"
      breadcrumb={[
        { label: 'دسترنج', href: '/' },
        { label: 'تنظیمات کسب و کار', href: '/business-settings' },
        { label: 'سیاست‌های کاری' },
      ]}
    >
      <div className="flex justify-start">
        <div className="flex items-center gap-3" dir="ltr">
          <Link
            href="/policies/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition-colors hover:bg-indigo-500"
            dir="rtl"
          >
            <Plus className="h-4 w-4" />
            افزودن سیاست
          </Link>

          <form action="/policies" method="get" className="relative">
            <Search className="pointer-events-none absolute left-1 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-200" />
            <input
              name="q"
              defaultValue={q}
              aria-label="جستجوی سیاست"
              className="h-10 w-10 rounded-full border border-transparent bg-transparent p-0 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:w-56 focus:border-white/10 focus:bg-slate-900/70 focus:px-4 focus:pl-9"
              placeholder="جستجو"
              dir="rtl"
            />
          </form>
        </div>
      </div>

      <section className="grid min-h-[430px] gap-6 lg:grid-cols-[minmax(360px,0.95fr)_minmax(460px,1.05fr)]" dir="ltr">
        <Link
          href="/policies/new"
          className="group flex min-h-[210px] items-center justify-center rounded-[26px] border border-dashed border-white/0 bg-transparent p-6 text-center transition-colors hover:border-white/10 hover:bg-slate-950/15"
          dir="rtl"
        >
          <div className="grid justify-items-center gap-5">
            <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-white/55 bg-slate-950/20 text-slate-100 transition-colors group-hover:border-indigo-300 group-hover:bg-indigo-500/10">
              <span className="absolute inset-2 rounded-xl bg-white text-slate-950" />
              <Plus className="relative h-8 w-8" strokeWidth={3} />
            </span>
            <span className="text-base font-bold text-slate-300">برای افزودن سیاست کاری کلیک کنید.</span>
          </div>
        </Link>

        <div className="grid content-start gap-4" dir="rtl">
          {filteredPolicies.length > 0 ? (
            filteredPolicies.map((policy) => {
              const familyKey = getPolicyFamilyKey(policy);
              const familyTitle = resolveFamilyLabel(familyKey);
              const sectionValues = getPolicySectionValues(policy);
              const variantKey = typeof sectionValues.variant === 'string' ? sectionValues.variant : null;
              const variantTitle = familyKey ? getPolicyVariantMeta(familyKey, variantKey)?.title ?? '' : '';
              const editHref = familyKey ? `/policies/${familyKey}?policyId=${policy.id}` : `/policies/work?policyId=${policy.id}`;

              return (
                <article
                  key={policy.id}
                  className="relative min-h-[178px] rounded-[26px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.28)] transition-colors hover:border-indigo-400/35"
                >
                  <div className="absolute left-5 top-5">
                    <CardMenu
                      items={[
                        { kind: 'link', href: editHref, label: 'ویرایش' },
                        {
                          kind: 'submit',
                          label: 'حذف',
                          tone: 'danger',
                          action: deletePolicyAction,
                          hiddenFields: { id: policy.id },
                          confirm: {
                            title: 'حذف سیاست کاری',
                            description: `آیا از حذف «${policy.title}» مطمئن هستید؟ این رکورد از فهرست حذف می‌شود.`,
                            confirmLabel: 'بله، حذف شود',
                            cancelLabel: 'انصراف',
                          },
                        },
                      ]}
                    />
                  </div>

                  <div className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/20">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>

                  <div className="grid gap-5 pr-16 pl-12 text-right">
                    <div className="grid gap-4 pt-1">
                      <h2 className="text-base font-black text-white">{policy.title}</h2>
                      <p className="min-h-6 text-sm leading-7 text-slate-400">{policy.description ?? 'بدون توضیحات'}</p>
                    </div>

                    <div className="grid gap-4 border-t border-white/10 pt-4 text-xs text-slate-300 sm:grid-cols-3">
                      <div>
                        <span className="text-slate-500">ایجاد شده در: </span>
                        <span className="font-bold text-white">{formatDate(policy.createdAt)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">ایجاد شده در: </span>
                        <span className="font-bold text-white">{policy.employeeCount ?? 0} نفر</span>
                      </div>
                      <div>
                        <span className="text-slate-500">ایجاد شده در: </span>
                        <span className="font-bold text-white">{familyTitle}</span>
                      </div>
                    </div>

                    {variantTitle || policy.calendar?.title ? (
                      <div className="flex flex-wrap gap-2 text-xs font-bold">
                        {variantTitle ? <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">{variantTitle}</span> : null}
                        {policy.calendar?.title ? <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">{policy.calendar.title}</span> : null}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-[26px] border border-dashed border-white/10 bg-slate-900/35 p-6 text-center text-sm text-slate-300">
              سیاستی برای نمایش وجود ندارد.
            </div>
          )}
        </div>
      </section>
    </PolicyPageShell>
  );
}
