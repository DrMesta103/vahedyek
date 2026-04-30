import { listPolicies } from '../../lib/data';
import { DataTable, EmptyState, PageIntro, PrimaryLink } from '@repo/ui';

export default async function PoliciesPage() {
  const items = await listPolicies();

  return (
    <div className="page-stack">
      <PageIntro title="سیاست‌های کاری" description="سیاست‌های حضور و غیاب، اضافه‌کاری، مرخصی و تردد." action={<PrimaryLink href="/policies/new">افزودن سیاست</PrimaryLink>} />
      {items.length === 0 ? (
        <EmptyState title="سیاستی ثبت نشده" description="برای ادامه راه‌اندازی یک سیاست کاری نیاز است." action={<PrimaryLink href="/policies/new">ثبت سیاست</PrimaryLink>} />
      ) : (
        <DataTable columns={['عنوان', 'تقویم', 'تعداد کارمند', 'تعداد گروه']} rows={items.map((item) => [item.title, item.calendar?.title ?? '-', item.employeeCount, item.workGroups.length])} />
      )}
    </div>
  );
}
