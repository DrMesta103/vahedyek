import { listWorkGroups } from '../../lib/data';
import { workGroupAccessLabels } from '../../lib/constants';
import { EmptyState, PageIntro, PrimaryLink } from '@repo/ui';

export default async function WorkGroupsPage() {
  const items = await listWorkGroups();

  return (
    <div className="page-stack">
      <PageIntro title="گروه‌های کاری" description="اتصال کارمندان، محل کار و سیاست‌ها در قالب گروه‌های اجرایی." action={<PrimaryLink href="/work-groups/new">افزودن گروه</PrimaryLink>} />
      {items.length === 0 ? (
        <EmptyState title="گروهی وجود ندارد" description="مرحله پنجم راه‌اندازی از اینجا تکمیل می‌شود." action={<PrimaryLink href="/work-groups/new">ایجاد گروه</PrimaryLink>} />
      ) : (
        <div className="list-grid">
          {items.map((item) => (
            <article key={item.id} className="entity-card">
              <div>
                <h3>{item.title}</h3>
                <p>{item.description ?? 'بدون توضیح'}</p>
              </div>
              <div className="card-meta">
                <span>محل: {item.location?.title ?? '-'}</span>
                <span>سیاست: {item.policy?.title ?? '-'}</span>
                <span>اعضا: {item.members.map((member) => `${member.employee.firstName} ${member.employee.lastName} (${workGroupAccessLabels[member.accessLevel]})`).join('، ') || '-'}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
