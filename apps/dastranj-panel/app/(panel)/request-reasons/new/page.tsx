import { createRequestReasonAction } from '../../../lib/actions';
import { requestReasonLabels } from '../../../lib/constants';
import { FormCard, PageIntro } from '@repo/ui/server';

export default function NewRequestReasonPage() {
  return (
    <div className="page-stack">
      <PageIntro title="افزودن دلیل درخواست" description="ثبت دلیل جدید برای حضور، مرخصی، ماموریت و سایر فرایندها." />
      <FormCard title="فرم دلیل درخواست">
        <form action={createRequestReasonAction} className="form-grid">
          <label>
            <span>عنوان</span>
            <input name="title" required />
          </label>
          <label>
            <span>دسته</span>
            <select name="category" defaultValue="attendance">
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
              ثبت دلیل
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
