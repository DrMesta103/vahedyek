import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LocationForm } from '../../../../components/LocationForm';
import { updateLocationAction } from '../../../../lib/actions';
import { getLocation } from '../../../../lib/data';
import { FormCard, PageIntro } from '@repo/ui/server';

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
        description="مشخصات محل و نقطه‌ی انتخاب‌شده را به‌روزرسانی کنید."
        action={
          <Link href="/locations" className="secondary-link">
            بازگشت به لیست
          </Link>
        }
      />
      <FormCard title="مشخصات محل">
        <LocationForm
          action={updateLocationAction}
          submitLabel="ذخیره تغییرات"
          initialValues={{
            id: location.id,
            title: location.title,
            radius: location.radius,
            address: location.address,
            description: location.description,
            latitude: location.latitude?.toString() ?? null,
            longitude: location.longitude?.toString() ?? null,
          }}
        />
      </FormCard>
    </div>
  );
}
