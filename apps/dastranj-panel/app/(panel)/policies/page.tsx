import { CardMenu } from '../../components/CardMenu';
import { ModuleAddTile } from '../../components/module-page/ModuleAddTile';
import { ModulePageHeader } from '../../components/module-page/ModulePageHeader';
import { deletePolicyAction } from '../../lib/actions';
import { listPolicies } from '../../lib/data';
import {
  POLICY_FAMILIES,
  getPolicyFamilyKey,
  getPolicySectionValues,
  getPolicyVariantMeta,
  type PolicyFamilyKey,
} from '../../lib/policy-workspaces';

type PoliciesPageProps = {
  searchParams?: { q?: string } | Promise<{ q?: string }>;
};

function resolveFamilyLabel(familyKey: PolicyFamilyKey | null) {
  if (!familyKey) return 'سیاست کاری';
  return POLICY_FAMILIES.find((item) => item.key === familyKey)?.title ?? 'سیاست';
}

function formatCalendarYear(calendar: { yearLabel: string } | null | undefined) {
  if (!calendar?.yearLabel?.trim()) return 'ثبت نشده';
  return calendar.yearLabel.trim();
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
        const haystack = normalize(
          [policy.title, policy.description ?? '', familyTitle, variantTitle, formatCalendarYear(policy.calendar)].join(' '),
        );
        return haystack.includes(query);
      })
    : policies;

  return (
    <div className="page-stack module-page" dir="rtl" lang="fa">
      <ModulePageHeader
        title="سیاست‌های کاری"
        subtitle="مدیریت قوانین و سیاست‌های حضور و غیاب کارمندان"
        addHref="/policies/new"
        addLabel="افزودن سیاست"
      />

      <div className="module-page-toolbar">
        <form action="/policies" method="get" className="module-year-filter">
          <input
            type="search"
            name="q"
            defaultValue={q}
            aria-label="جستجوی سیاست"
            placeholder="جستجوی سیاست..."
          />
        </form>
      </div>

      <div className="module-page-grid">
        {filteredPolicies.map((policy) => {
          const familyKey = getPolicyFamilyKey(policy);
          const editHref = familyKey ? `/policies/${familyKey}?policyId=${policy.id}` : `/policies/work?policyId=${policy.id}`;

          return (
            <article key={policy.id} className="module-grid-card">
              <div className="module-grid-card-top">
                <div className="module-grid-card-body">
                  <h3>{policy.title}</h3>
                  <p>توضیحات : {policy.description?.trim() ? policy.description : 'ثبت نشده'}</p>
                  <p>تقویم: {formatCalendarYear(policy.calendar)}</p>
                </div>

                <div className="module-grid-card-top-actions">
                  <CardMenu
                    items={[
                      { kind: 'link', href: editHref, label: 'جزئیات' },
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
              </div>
            </article>
          );
        })}
        <ModuleAddTile href="/policies/new" label="برای افزودن سیاست کاری کلیک کنید." />
      </div>
    </div>
  );
}
