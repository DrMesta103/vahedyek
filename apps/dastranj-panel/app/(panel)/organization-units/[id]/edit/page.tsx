import Link from 'next/link';
import { notFound } from 'next/navigation';
import { updateOrganizationUnitAction } from '../../../../lib/actions';
import { getOrganizationUnit, getOrganizationUnitFormOptions } from '../../../../lib/data';
import { FormCard, PageIntro } from '@repo/ui/server';

type EditOrganizationUnitPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditOrganizationUnitPage({ params }: EditOrganizationUnitPageProps) {
  const { id } = await params;
  const unit = await getOrganizationUnit(id);

  if (!unit) {
    notFound();
  }
  if (unit.status === 'ARCHIVED') {
    return <div className="page-stack" dir="rtl" lang="fa"><PageIntro title="واحد سازمانی آرشیوی" description="این واحد فقط برای مشاهده سوابق نگهداری می‌شود و امکان ویرایش آن وجود ندارد." action={<Link href="/organization-units" className="secondary-link">بازگشت به فهرست</Link>} /><FormCard title="مشخصات واحد"><dl className="org-archived-summary"><div><dt>عنوان</dt><dd>{unit.title}</dd></div><div><dt>کد</dt><dd>{unit.code || 'ثبت نشده'}</dd></div><div><dt>نوع</dt><dd>{unit.type}</dd></div></dl></FormCard></div>;
  }
  const options = await getOrganizationUnitFormOptions(id);

  return (
    <div className="page-stack">
      <PageIntro
        title="ویرایش واحد سازمانی"
        description="عنوان و توضیحات واحد را به‌روزرسانی کنید."
        action={
          <Link href="/organization-units" className="secondary-link">
            بازگشت به لیست
          </Link>
        }
      />
      <FormCard title="مشخصات واحد">
        <form action={updateOrganizationUnitAction} className="form-grid">
          <input type="hidden" name="id" value={unit.id} />
          <label>
            <span>عنوان</span>
            <input name="title" defaultValue={unit.title} required />
          </label>
          <label><span>کد واحد</span><input name="code" defaultValue={unit.code ?? ''} /></label>
          <label><span>نوع واحد</span><select name="type" defaultValue={unit.type}><option value="DEPARTMENT">واحد</option><option value="DIVISION">مدیریت</option><option value="TEAM">تیم</option><option value="BRANCH">شعبه</option></select></label>
          <label><span>واحد بالادست</span><select name="parentId" defaultValue={unit.parentId ?? ''}><option value="">ریشه سازمان</option>{options.units.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <label><span>مدیر واحد</span><select name="managerId" defaultValue={unit.managerId ?? ''}><option value="">بدون مدیر</option>{options.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}{employee.personnelCode ? ` — ${employee.personnelCode}` : ''}</option>)}</select></label>
          <label className="full-span">
            <span>توضیح</span>
            <textarea name="description" rows={4} defaultValue={unit.description ?? ''} />
          </label>
          <div className="full-span">
            <button type="submit" className="primary-button">
              ذخیره تغییرات
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
