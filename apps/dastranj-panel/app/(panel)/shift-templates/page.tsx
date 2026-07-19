import { listShiftTemplates } from '../../lib/data';
import { getShiftTemplateAccess } from '../../lib/shift-template-access';
import { ShiftTemplatesPageClient } from './_components/ShiftTemplatesPageClient';

export default async function ShiftTemplatesPage() {
  const access = await getShiftTemplateAccess();
  if (!access.canView) {
    return <div className="page-stack module-page shift-templates-page" dir="rtl" lang="fa"><div className="shift-template-access-state"><h1>دسترسی به قالب‌های شیفت</h1><p>شما اجازه مشاهده یا مدیریت قالب‌های شیفت این سازمان را ندارید.</p></div></div>;
  }

  let items;
  let error: string | null = null;
  try {
    items = await listShiftTemplates();
  } catch {
    items = [];
    error = 'دریافت قالب‌های شیفت با خطا مواجه شد. لطفاً دوباره تلاش کنید.';
  }

  return (
    <div className="page-stack module-page shift-templates-page" dir="rtl" lang="fa">
      <ShiftTemplatesPageClient items={items} canManage={access.canManage} error={error} />
    </div>
  );
}
