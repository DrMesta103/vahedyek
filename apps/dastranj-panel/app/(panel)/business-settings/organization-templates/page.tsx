import { ShieldX } from 'lucide-react';
import { getOrganizationStructureTemplatesForManagement } from '../../../lib/data';
import { OrganizationTemplatesClient } from './_components/OrganizationTemplatesClient';

export default async function OrganizationTemplatesPage() {
  const data = await getOrganizationStructureTemplatesForManagement();
  if (!data.access.canView) return <section className="org-empty-state" dir="rtl"><ShieldX/><h1>دسترسی مشاهده قالب‌های ساختار سازمانی را ندارید.</h1></section>;
  return <div className="page-stack module-page" dir="rtl" lang="fa"><OrganizationTemplatesClient initialTemplates={data.templates} canCreate={data.access.canCreate} canUpdate={data.access.canUpdate}/></div>;
}
