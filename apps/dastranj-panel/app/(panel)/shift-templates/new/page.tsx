import { createShiftTemplateAction } from '../../../lib/actions';
import { shiftTypeLabels } from '../../../lib/constants';
import { FormCard, PageIntro } from '../../../components/ui';

export default function NewShiftTemplatePage() {
  return (
    <div className="page-stack">
      <PageIntro title="افزودن قالب شیفت" description="نسخه خلاصه‌شده ولی دیتابیس‌محور از ساختار پروتوتایپ." />
      <FormCard title="مشخصات قالب">
        <form action={createShiftTemplateAction} className="form-grid">
          <label>
            <span>عنوان</span>
            <input name="title" required />
          </label>
          <label>
            <span>نوع</span>
            <select name="type" defaultValue="fixed">
              {Object.entries(shiftTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="full-span">
            <span>توضیح</span>
            <textarea name="description" rows={3} />
          </label>
          <label className="full-span">
            <span>روزهای هفته</span>
            <input name="weekDays" placeholder="شنبه, یکشنبه, دوشنبه" />
          </label>
          <label>
            <span>ساعت شروع</span>
            <input name="startTime" defaultValue="08:00" />
          </label>
          <label>
            <span>ساعت پایان</span>
            <input name="endTime" defaultValue="16:30" />
          </label>
          <label>
            <span>دقایق موظفی</span>
            <input name="requiredMinutes" type="number" defaultValue="510" />
          </label>
          <label className="checkbox-row">
            <input name="isActive" type="checkbox" defaultChecked />
            <span>فعال باشد</span>
          </label>
          <div className="full-span">
            <button type="submit" className="primary-button">
              ثبت قالب
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
