import { createOrganizationUnitAction } from '../../../lib/actions';
import { FormCard, PageIntro } from '@repo/ui';

export default function NewOrganizationUnitPage() {
  return (
    <div className="page-stack">
      <PageIntro title="افزودن واحد سازمانی" description="واحدهای منابع انسانی، مالی، عملیات و ... را اینجا تعریف کنید." />
      <FormCard title="مشخصات واحد">
        <form action={createOrganizationUnitAction} className="form-grid">
          <label>
            <span>عنوان</span>
            <input name="title" required />
          </label>
          <label className="full-span">
            <span>توضیح</span>
            <textarea name="description" rows={4} />
          </label>
          <div className="full-span">
            <button type="submit" className="primary-button">
              ثبت واحد
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
