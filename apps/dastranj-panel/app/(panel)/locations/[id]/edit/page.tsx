import Link from 'next/link';
import { notFound } from 'next/navigation';
import { updateLocationAction } from '../../../../lib/actions';
import { getLocation } from '../../../../lib/data';
import { FormCard, PageIntro } from '@repo/ui';

type EditLocationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditLocationPage({ params }: EditLocationPageProps) {
  const { id } = await params;
  const location = await getLocation(id);

  if (!location) {
    notFound();
  }

  return (
    <div className="page-stack">
      <PageIntro
        title="ویرایش محل کار"
        description="مشخصات این محل را به‌روزرسانی کنید."
        action={
          <Link href="/locations" className="secondary-link">
            بازگشت به لیست
          </Link>
        }
      />
      <FormCard title="مشخصات محل">
        <form action={updateLocationAction} className="form-grid">
          <input type="hidden" name="id" value={location.id} />
          <label>
            <span>عنوان</span>
            <input name="title" defaultValue={location.title} required />
          </label>
          <label>
            <span>شعاع مجاز (متر)</span>
            <input name="radius" type="number" defaultValue={location.radius} required />
          </label>
          <label className="full-span">
            <span>آدرس</span>
            <input name="address" defaultValue={location.address} required />
          </label>
          <label className="full-span">
            <span>توضیح</span>
            <textarea name="description" rows={4} defaultValue={location.description ?? ''} />
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
