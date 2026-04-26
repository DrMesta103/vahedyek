import { createLocationAction } from '../../../lib/actions';
import { FormCard, PageIntro } from '../../../components/ui';

export default function NewLocationPage() {
  return (
    <div className="page-stack">
      <PageIntro title="افزودن محل کار" description="نسخه نکست این فرم را مستقیم در دیتابیس ثبت می‌کند." />
      <FormCard title="مشخصات محل">
        <form action={createLocationAction} className="form-grid">
          <label>
            <span>عنوان</span>
            <input name="title" required />
          </label>
          <label>
            <span>شعاع مجاز (متر)</span>
            <input name="radius" type="number" defaultValue="100" required />
          </label>
          <label className="full-span">
            <span>آدرس</span>
            <input name="address" required />
          </label>
          <label className="full-span">
            <span>توضیح</span>
            <textarea name="description" rows={4} />
          </label>
          <div className="full-span">
            <button type="submit" className="primary-button">
              ثبت محل کار
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
