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
    return <div className="page-stack" dir="rtl" lang="fa"><PageIntro title="واحد سازمانی آرشیوی" description="این واحد فقط برای مشاهده سوابق نگهداری می‌شود و امکان ویرایش آن وجود ندارد." action={<Link href={`/organization-units/${unit.id}`} className="secondary-link">بازگشت به پروفایل</Link>} /><FormCard title="مشخصات واحد"><dl className="org-archived-summary"><div><dt>عنوان</dt><dd>{unit.title}</dd></div><div><dt>کد</dt><dd>{unit.code || 'ثبت نشده'}</dd></div><div><dt>نوع</dt><dd>{unit.type}</dd></div><div><dt>مأموریت</dt><dd>{unit.mission||'ثبت نشده'}</dd></div></dl></FormCard></div>;
  }
  const options = await getOrganizationUnitFormOptions(id);

  return (
    <div className="page-stack">
      <PageIntro
        title="ویرایش واحد سازمانی"
        description="عنوان و توضیحات واحد را به‌روزرسانی کنید."
        action={
          <Link href={`/organization-units/${unit.id}`} className="secondary-link">
            بازگشت به پروفایل
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
          <label className="full-span"><span>مأموریت واحد</span><textarea name="mission" rows={4} maxLength={10000} defaultValue={unit.mission ?? ''} /><small>دلیل وجود و نقش محوری این واحد را بنویسید.</small></label>
          <label className="full-span"><span>وظایف اصلی واحد</span><textarea name="mainResponsibilities" rows={6} defaultValue={Array.isArray(unit.mainResponsibilities) ? unit.mainResponsibilities.filter((item): item is string => typeof item === 'string').join('\n') : ''} /><small>هر مسئولیت را در یک خط وارد کنید.</small></label>
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
