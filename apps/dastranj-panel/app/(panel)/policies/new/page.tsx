import { listCalendars } from '../../../lib/data';
import { getPolicyAccess } from '../../../lib/policy-access';
import { PolicyPageShell } from '../_components/PolicyWorkspaceShell';
import { PolicyCreateForm } from './PolicyCreateForm';

export default async function NewPolicyPage() {
  const [calendars, access] = await Promise.all([listCalendars(), getPolicyAccess()]);
  if (!access.canManage) return <div className="page-stack module-page" dir="rtl" lang="fa"><div className="module-empty-state"><h2>دسترسی ایجاد سیاست کاری ندارید.</h2><p>برای این عملیات به نقش مالک، مدیر یا مدیر منابع انسانی نیاز است.</p></div></div>;

  return (
    <PolicyPageShell
      title="ثبت سیاست کاری جدید"
      subtitle="تنظیم قوانین حضور و غیاب کارمندان"
    >
      <PolicyCreateForm calendars={calendars.map((calendar) => ({ id: calendar.id, title: calendar.title, yearLabel: calendar.yearLabel, status: calendar.status }))} />
    </PolicyPageShell>
  );
}
