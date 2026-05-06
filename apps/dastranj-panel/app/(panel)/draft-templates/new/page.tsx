import { createDraftTemplateAction } from '../../../lib/actions';
import { draftTemplateLabels } from '../../../lib/constants';
import { FormCard, PageIntro } from '@repo/ui/server';

export default function NewDraftTemplatePage() {
  return (
    <div className="page-stack">
      <PageIntro title="افزودن قالب پیش‌نویس" description="بدنه قالب در دیتابیس ذخیره می‌شود و آماده توسعه بیشتر است." />
      <FormCard title="فرم قالب">
        <form action={createDraftTemplateAction} className="form-grid">
          <label><span>عنوان</span><input name="title" required /></label>
          <label><span>دسته</span><select name="category" defaultValue="hr">{Object.entries(draftTemplateLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <label><span>نسخه</span><input name="version" type="number" defaultValue="1" /></label>
          <label className="checkbox-row"><input name="isActive" type="checkbox" defaultChecked /><span>فعال باشد</span></label>
          <label className="full-span"><span>توضیح</span><textarea name="description" rows={3} /></label>
          <label className="full-span"><span>متن قالب</span><textarea name="body" rows={10} required /></label>
          <div className="full-span"><button type="submit" className="primary-button">ثبت قالب</button></div>
        </form>
      </FormCard>
    </div>
  );
}
