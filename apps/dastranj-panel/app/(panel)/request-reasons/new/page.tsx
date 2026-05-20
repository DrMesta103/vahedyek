import Link from 'next/link';
import { createRequestReasonAction } from '../../../lib/actions';
import { requestReasonCategories, requestReasonLabels } from '../../../lib/constants';
import { FormCard, PageIntro } from '@repo/ui/server';

type NewRequestReasonPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function NewRequestReasonPage({ searchParams }: NewRequestReasonPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const categoryParam = resolvedSearchParams?.category;
  const defaultCategory =
    categoryParam && requestReasonCategories.includes(categoryParam as (typeof requestReasonCategories)[number])
      ? categoryParam
      : 'attendance';

  return (
    <div className="page-stack">
      <PageIntro
        title="افزودن علت درخواست"
        description="ثبت علت جدید برای حضور، مرخصی، ماموریت و سایر فرایندها."
        action={
          <Link href={`/request-reasons?category=${defaultCategory}`} className="secondary-link">
            بازگشت به لیست
          </Link>
        }
      />
      <FormCard title="فرم علت درخواست">
        <form action={createRequestReasonAction} className="form-grid">
          <label>
            <span>عنوان</span>
            <input name="title" required />
          </label>
          <label>
            <span>دسته</span>
            <select name="category" defaultValue={defaultCategory}>
              {Object.entries(requestReasonLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="full-span">
            <span>توضیح</span>
            <textarea name="description" rows={4} />
          </label>
          <label className="checkbox-row">
            <input name="isActive" type="checkbox" defaultChecked />
            <span>فعال باشد</span>
          </label>
          <div className="full-span">
            <button type="submit" className="primary-button">
              ثبت علت
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
