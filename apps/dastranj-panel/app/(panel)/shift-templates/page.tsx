import { listShiftTemplates } from '../../lib/data';
import { ShiftTemplatesPageClient } from './_components/ShiftTemplatesPageClient';

export default async function ShiftTemplatesPage() {
  const items = await listShiftTemplates();

  return (
    <div className="page-stack module-page shift-templates-page" dir="rtl" lang="fa">
      <ShiftTemplatesPageClient items={items} />
    </div>
  );
}
