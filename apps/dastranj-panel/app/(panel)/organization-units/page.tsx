import { listOrganizationUnits } from '../../lib/data';
import { DataTable, EmptyState, PageIntro, PrimaryLink } from '@repo/ui';

export default async function OrganizationUnitsPage() {
  const items = await listOrganizationUnits();

  return (
    <div className="page-stack">
      <PageIntro title="واحدهای سازمانی" description="تعریف ساختار سازمان برای اتصال کارمندان به واحدها." action={<PrimaryLink href="/organization-units/new">افزودن واحد</PrimaryLink>} />
      {items.length === 0 ? (
        <EmptyState title="واحدی وجود ندارد" description="از این بخش می‌توانید ساختار سازمان را تعریف کنید." action={<PrimaryLink href="/organization-units/new">تعریف واحد</PrimaryLink>} />
      ) : (
        <DataTable columns={['عنوان', 'توضیح', 'تعداد انتساب']} rows={items.map((item) => [item.title, item.description ?? '-', item.employees.length])} />
      )}
    </div>
  );
}
