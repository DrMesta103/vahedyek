"use client";

import { archiveJobGrade, archiveJobRank, saveJobGrade, saveJobRank } from "../../../lib/job-classification-actions";
import { RecoverableMutationForm } from "./RecoverableMutationForm";

type Rank = { id: string; gradeId: string; name: string; code: string; description: string | null; sortOrder: number; status: string };
type Grade = { id: string; name: string; code: string; description: string | null; sortOrder: number; status: string; ranks: Rank[] };

export function GradeRankManager({ grades, access }: { grades: Grade[]; access: { canCreate: boolean; canUpdate: boolean; canArchive: boolean } }) {
  const activeGrades = grades.filter((grade) => grade.status === "ACTIVE");
  return (
    <section className="org-profile-card" dir="rtl">
      <h2>ویرایش و آرشیو گرید و رتبه</h2>
      {!grades.length ? (
        <div className="module-empty-state">
          <p>هنوز گریدی ثبت نشده است.</p>
        </div>
      ) : null}
      <div className="module-page-grid">
        {grades.map((grade) => (
          <article className="module-grid-card" key={grade.id}>
            <div className="module-card-title-row">
              <h3>
                {grade.name} · {grade.code}
              </h3>
              <span>{grade.status === "ACTIVE" ? "فعال" : "آرشیو"}</span>
            </div>
            {access.canUpdate && grade.status === "ACTIVE" ? (
              <details>
                <summary>ویرایش گرید</summary>
                <RecoverableMutationForm action={saveJobGrade} className="org-professional-form" successMessage="گرید ذخیره شد.">
                  <input type="hidden" name="id" value={grade.id} />
                  <label>
                    <span>نام</span>
                    <input name="name" defaultValue={grade.name} required />
                  </label>
                  <label>
                    <span>کد</span>
                    <input name="code" defaultValue={grade.code} required />
                  </label>
                  <label>
                    <span>ترتیب</span>
                    <input name="sortOrder" type="number" min="0" defaultValue={grade.sortOrder} required />
                  </label>
                  <label>
                    <span>شرح</span>
                    <input name="description" defaultValue={grade.description ?? ""} />
                  </label>
                  <button type="submit">ذخیره گرید</button>
                </RecoverableMutationForm>
              </details>
            ) : null}
            {access.canArchive && grade.status === "ACTIVE" ? (
              <RecoverableMutationForm action={archiveJobGrade}>
                <input type="hidden" name="id" value={grade.id} />
                <button type="submit">آرشیو گرید</button>
              </RecoverableMutationForm>
            ) : null}
            <h4>رتبه‌ها</h4>
            {!grade.ranks.length ? (
              <p>بدون رتبه</p>
            ) : (
              grade.ranks.map((rank) => (
                <div className="module-grid-card" key={rank.id}>
                  <strong>
                    {rank.name} · {rank.code}
                  </strong>
                  {access.canUpdate && rank.status === "ACTIVE" ? (
                    <details>
                      <summary>ویرایش رتبه</summary>
                      <RecoverableMutationForm action={saveJobRank} className="org-professional-form" successMessage="رتبه ذخیره شد.">
                        <input type="hidden" name="id" value={rank.id} />
                        <label>
                          <span>گرید</span>
                          <select name="gradeId" defaultValue={rank.gradeId} required>
                            {activeGrades.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>نام</span>
                          <input name="name" defaultValue={rank.name} required />
                        </label>
                        <label>
                          <span>کد</span>
                          <input name="code" defaultValue={rank.code} required />
                        </label>
                        <label>
                          <span>ترتیب</span>
                          <input name="sortOrder" type="number" min="0" defaultValue={rank.sortOrder} required />
                        </label>
                        <label>
                          <span>شرح</span>
                          <input name="description" defaultValue={rank.description ?? ""} />
                        </label>
                        <button type="submit">ذخیره رتبه</button>
                      </RecoverableMutationForm>
                    </details>
                  ) : null}
                  {access.canArchive && rank.status === "ACTIVE" ? (
                    <RecoverableMutationForm action={archiveJobRank}>
                      <input type="hidden" name="id" value={rank.id} />
                      <button type="submit">آرشیو رتبه</button>
                    </RecoverableMutationForm>
                  ) : null}
                </div>
              ))
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
