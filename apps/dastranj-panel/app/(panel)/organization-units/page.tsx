import { listOrganizationUnits } from '../../lib/data';
import { EmptyState, PageIntro, PrimaryLink } from '@repo/ui/server';

export default async function OrganizationUnitsPage() {
  const items = await listOrganizationUnits();

  return (
    <div className="page-stack">
      <PageIntro title="واحدهای سازمانی" description="تعریف ساختار سازمان برای اتصال کارمندان به واحدها." action={<PrimaryLink href="/organization-units/new">افزودن واحد</PrimaryLink>} />
      {items.length === 0 ? (
        <EmptyState title="واحدی وجود ندارد" description="از این بخش می‌توانید ساختار سازمان را تعریف کنید." action={<PrimaryLink href="/organization-units/new">تعریف واحد</PrimaryLink>} />
      ) : (
        <div className="catalog-grid">
          {items.map((item) => (
            <article key={item.id} className="catalog-card">
              <div className="catalog-card-head">
                <span className="catalog-pill">{item.employees.length} انتساب</span>
                <h3>{item.title}</h3>
                <p>{item.description ?? 'برای این واحد توضیحی ثبت نشده است.'}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
