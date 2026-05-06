import { createWorkGroupAction } from '../../../lib/actions';
import { listEmployees, listLocations, listPolicies } from '../../../lib/data';
import { workGroupAccessLabels } from '../../../lib/constants';
import { FormCard, PageIntro } from '@repo/ui/server';

export default async function NewWorkGroupPage() {
  const [employees, locations, policies] = await Promise.all([listEmployees(), listLocations(), listPolicies()]);

  return (
    <div className="page-stack">
      <PageIntro title="افزودن گروه کاری" description="گروه کاری با اعضا، محل و سیاست متناظر." />
      <FormCard title="فرم گروه کاری">
        <form action={createWorkGroupAction} className="form-grid">
          <label><span>عنوان</span><input name="title" required /></label>
          <label><span>محل کار</span><select name="locationId" defaultValue=""><option value="">بدون محل</option>{locations.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <label><span>سیاست</span><select name="policyId" defaultValue=""><option value="">بدون سیاست</option>{policies.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <label className="full-span"><span>توضیح</span><textarea name="description" rows={4} /></label>
          <label className="full-span"><span>تگ‌ها</span><input name="tags" placeholder="ستاد, منابع انسانی, شیفت اداری" /></label>
          <div className="full-span fieldset">
            <span>اعضا</span>
            <div className="checkbox-list">
              {employees.map((employee) => (
                <div key={employee.id} className="member-pick">
                  <label className="checkbox-row">
                    <input name="employeeIds" type="checkbox" value={employee.id} />
                    <span>{`${employee.firstName} ${employee.lastName}`}</span>
                  </label>
                  <select name={`accessLevel:${employee.id}`} defaultValue="employee">
                    {Object.entries(workGroupAccessLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
          <div className="full-span"><button type="submit" className="primary-button">ثبت گروه کاری</button></div>
        </form>
      </FormCard>
    </div>
  );
}
