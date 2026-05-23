import Link from 'next/link';
import { policyBreadcrumbs } from '../../../components/module-page/module-breadcrumbs';
import { listPolicies } from '../../../lib/data';
import { getPolicyFamilyKey, getPolicySectionValues } from '../../../lib/policy-workspaces';
import { PolicyInfoStrip, PolicyNavLink, PolicyPageShell } from '../_components/PolicyWorkspaceShell';
import { PolicyOverviewCard } from './_components/PolicyOverviewCard';

type WorkPolicyPageProps = {
  searchParams?: { policyId?: string } | Promise<{ policyId?: string }>;
};

export default async function WorkPolicyOverviewPage({ searchParams }: WorkPolicyPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const policies = await listPolicies();
  const selectedPolicy =
    (resolvedSearchParams.policyId ? policies.find((item) => item.id === resolvedSearchParams.policyId) : null) ??
    policies.find((item) => getPolicyFamilyKey(item) === 'work') ??
    policies.find((item) => !getPolicyFamilyKey(item)) ??
    null;

  const sectionValues = getPolicySectionValues(selectedPolicy);
  const title = typeof sectionValues.title === 'string' ? sectionValues.title : selectedPolicy?.title ?? 'سیاست کاری';
  const description =
    typeof sectionValues.description === 'string' ? sectionValues.description : selectedPolicy?.description ?? '';
  const policyId = selectedPolicy?.id ?? '';
  const calendarYearLabel = selectedPolicy?.calendar?.yearLabel ?? '-';
  const calendarTitle = selectedPolicy?.calendar?.title ?? '';

  const sectionLinks = [
    { title: 'سیاست‌های شیفت', href: policyId ? `/policies/shift?policyId=${policyId}` : '/policies/shift' },
    { title: 'سیاست‌های شب‌کاری', href: policyId ? `/policies/night?policyId=${policyId}` : '/policies/night' },
    { title: 'سیاست‌های مرخصی', href: policyId ? `/policies/leave?policyId=${policyId}` : '/policies/leave' },
    { title: 'سیاست‌های اضافه‌کاری', href: policyId ? `/policies/work/base?policyId=${policyId}&section=overtime` : '/policies/work/base?section=overtime' },
    { title: 'سیاست‌های تردد دستی', href: policyId ? `/policies/manual?policyId=${policyId}` : '/policies/manual' },
    { title: 'سیاست‌های روز تعطیل', href: policyId ? `/policies/work/base?policyId=${policyId}&section=holiday` : '/policies/work/base?section=holiday' },
    { title: 'سایر سیاست‌ها', href: policyId ? `/policies/work/base?policyId=${policyId}&section=other` : '/policies/work/base?section=other' },
  ];

  return (
    <PolicyPageShell
      title="ویرایش سیاست کاری"
      subtitle="تنظیم قوانین حضور و غیاب کارمندان"
      breadcrumb={policyBreadcrumbs({ label: 'ویرایش سیاست کاری' })}
    >
      <div className="policy-work-layout">
        {selectedPolicy ? (
          <PolicyOverviewCard
            policyId={policyId}
            title={title}
            description={description}
            calendarYearLabel={calendarYearLabel}
            calendarTitle={calendarTitle}
          />
        ) : (
          <PolicyInfoStrip text="هنوز سیاست کاری پایه‌ای ثبت نشده است. از فهرست سیاست‌ها یک سیاست جدید ایجاد کنید." />
        )}

        <nav className="policy-work-sections" aria-label="بخش‌های سیاست کاری">
          {sectionLinks.map((item) => (
            <PolicyNavLink key={item.title} href={item.href} title={item.title} />
          ))}
        </nav>

        <div className="policy-work-footer">
          <Link href="/policies" className="policy-btn policy-btn-secondary">
            بازگشت به فهرست
          </Link>
        </div>
      </div>
    </PolicyPageShell>
  );
}
