import Link from 'next/link';
import { notFound } from 'next/navigation';
import { updateRequestReasonAction } from '../../../../lib/actions';
import { requestReasonLabels } from '../../../../lib/constants';
import { getRequestReason } from '../../../../lib/data';
import { FormCard, PageIntro } from '@repo/ui/server';

type EditRequestReasonPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditRequestReasonPage({ params }: EditRequestReasonPageProps) {
  const { id } = await params;
  const reason = await getRequestReason(id);

  if (!reason) {
    notFound();
  }

  return (
    <div className="page-stack">
      <PageIntro
        title="ویرایش علت درخواست"
        description="عنوان، دسته و وضعیت علت را به‌روزرسانی کنید."
        action={
          <Link href={`/request-reasons?category=${reason.category}`} className="secondary-link">
            بازگشت به لیست
          </Link>
        }
      />
      <FormCard title="مشخصات علت درخواست">
        <form action={updateRequestReasonAction} className="form-grid">
          <input type="hidden" name="id" value={reason.id} />
          <label>
            <span>عنوان</span>
            <input name="title" defaultValue={reason.title} required />
          </label>
          <label>
            <span>دسته</span>
            <select name="category" defaultValue={reason.category}>
              {Object.entries(requestReasonLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="full-span">
            <span>توضیح</span>
            <textarea name="description" rows={4} defaultValue={reason.description ?? ''} />
          </label>
          <label className="checkbox-row">
            <input name="isActive" type="checkbox" defaultChecked={reason.isActive} />
            <span>فعال باشد</span>
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
