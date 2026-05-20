import Link from 'next/link';
import { notFound } from 'next/navigation';
import { updateOrganizationUnitAction } from '../../../../lib/actions';
import { getOrganizationUnit } from '../../../../lib/data';
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
