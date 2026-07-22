"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { archiveJobCategory, archiveJobClassification, archiveJobFamily, archiveJobLevel, archiveJobEvaluationCriterion, archiveJobGrade, archiveJobRank, createJobCategory, createJobClassification, createJobFamily, createJobLevel, saveJobEvaluationCriterion, saveJobGrade, saveJobRank, updateJobCategory, updateJobClassification, updateJobFamily, updateJobLevel } from "../../../lib/job-classification-actions";
import { RecoverableMutationForm } from "./RecoverableMutationForm";

type Family = { id: string; name: string; code: string; description: string | null; status: string; categories: { id: string; name: string; code: string; status: string }[] };
type Level = { id: string; name: string; code: string; sortOrder: number; status: string };
type Profile = { id: string; title: string; code: string | null };
type Classification = { id: string; jobProfileId: string; familyId: string; categoryId: string | null; levelId: string; status: string; version: number; effectiveDate: string; reason: string | null; jobProfile: Profile; family: Family; category: { id: string; name: string } | null; level: Level; usageCount: number };
type Criterion = { id: string; title: string; description: string | null; weight: number; maxScore: number; status: string };
type Grade = { id: string; name: string; code: string; description: string | null; sortOrder: number; status: string; ranks: Rank[] };
type Rank = { id: string; gradeId: string; name: string; code: string; description: string | null; sortOrder: number; status: string };

export function JobClassificationsClient({ families, levels, profiles, classifications, criteria, evaluations, grades, ranks, access }: { families: Family[]; levels: Level[]; profiles: Profile[]; classifications: Classification[]; criteria: Criterion[]; evaluations: { id: string; totalScore: string | null; evaluationLevel: string | null; jobProfile: Profile }[]; grades: Grade[]; ranks: Rank[]; access: { canCreate: boolean; canUpdate: boolean; canArchive: boolean; canManageEvaluation: boolean } }) {
  const [query, setQuery] = useState("");
  const [familyFilter, setFamilyFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const filtered = useMemo(() => classifications.filter((item) => (!query || [item.jobProfile.title, item.jobProfile.code, item.family.name, item.category?.name, item.level.name].filter(Boolean).join(" ").toLowerCase().includes(query.toLowerCase())) && (!familyFilter || item.familyId === familyFilter) && (!levelFilter || item.levelId === levelFilter) && (!statusFilter || item.status === statusFilter)), [classifications, query, familyFilter, levelFilter, statusFilter]);
  const totalWeight = criteria.filter((item) => item.status === "ACTIVE").reduce((sum, item) => sum + item.weight, 0);
  return (
    <div className="page-stack module-page" dir="rtl">
      <header className="module-page-header">
        <div>
          <p className="module-page-eyebrow">معماری شغل</p>
          <h1>طبقه‌بندی‌های شغلی</h1>
          <p>خانواده، دسته، سطح و نسخه‌های طبقه‌بندی پروفایل‌های شغلی را مدیریت کنید.</p>
        </div>
        <Link href="/job-classifications/reports" className="calendar-create-submit">
          گزارش‌ها
        </Link>
      </header>
      <section className="org-profile-card">
        <h2>جستجو و فیلتر</h2>
        <div className="org-professional-form">
          <label>
            <span>جستجو</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="نام یا کد شغل" />
          </label>
          <label>
            <span>خانواده</span>
            <select value={familyFilter} onChange={(e) => setFamilyFilter(e.target.value)}>
              <option value="">همه</option>
              {families.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>سطح</span>
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
              <option value="">همه</option>
              {levels.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>وضعیت</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">همه</option>
              <option value="ACTIVE">فعال</option>
              <option value="ARCHIVED">آرشیو</option>
            </select>
          </label>
        </div>
      </section>
      {access.canCreate ? (
        <section className="org-profile-card">
          <h2>تعریف طبقه‌بندی جدید</h2>
          <RecoverableMutationForm action={createJobClassification} className="org-professional-form">
            <label>
              <span>پروفایل شغلی</span>
              <select name="jobProfileId" required>
                <option value="">انتخاب کنید</option>
                {profiles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                    {item.code ? ` · ${item.code}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>خانواده</span>
              <select name="familyId" required>
                <option value="">انتخاب کنید</option>
                {families
                  .filter((item) => item.status === "ACTIVE")
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              <span>دسته</span>
              <select name="categoryId">
                <option value="">بدون دسته</option>
                {families.flatMap((item) =>
                  item.categories
                    .filter((category) => category.status === "ACTIVE")
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {item.name} / {category.name}
                      </option>
                    )),
                )}
              </select>
            </label>
            <label>
              <span>سطح</span>
              <select name="levelId" required>
                <option value="">انتخاب کنید</option>
                {levels
                  .filter((item) => item.status === "ACTIVE")
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              <span>تاریخ اثرگذاری</span>
              <input name="effectiveDate" type="date" required />
            </label>
            <label>
              <span>دلیل</span>
              <input name="reason" required maxLength={500} />
            </label>
            <button className="calendar-create-submit" type="submit">
              ایجاد نسخه ۱
            </button>
          </RecoverableMutationForm>
        </section>
      ) : null}
      <section className="org-profile-card">
        <h2>فهرست طبقه‌بندی‌ها</h2>
        {!classifications.length ? (
          <div className="module-empty-state">
            <h3>هیچ Classification وجود ندارد</h3>
            <p>برای شروع، خانواده، دسته، سطح و سپس طبقه‌بندی بسازید.</p>
          </div>
        ) : !filtered.length ? (
          <div className="module-empty-state">
            <h3>هیچ نتیجه‌ای پیدا نشد</h3>
            <p>فیلترها یا عبارت جستجو را تغییر دهید.</p>
          </div>
        ) : (
          <div className="module-page-grid">
            {filtered.map((item) => (
              <article className="module-grid-card" key={item.id}>
                <div className="module-card-title-row">
                  <h3>{item.jobProfile.title}</h3>
                  <span className={`module-status-pill ${item.status === "ACTIVE" ? "is-active" : "is-inactive"}`}>{item.status === "ACTIVE" ? "فعال" : "آرشیو"}</span>
                </div>
                <p>
                  {item.family.name} {item.category ? ` / ${item.category.name}` : ""} / {item.level.name}
                </p>
                <p>
                  نسخه {item.version} · اثرگذاری: {new Date(item.effectiveDate).toLocaleDateString("fa-IR")}
                </p>
                <p>تعداد استفاده در سمت‌ها: {item.usageCount}</p>
                <p>{item.reason ?? "بدون دلیل ثبت‌شده"}</p>
                <Link href={`/job-classifications/${item.id}`}>مشاهده جزئیات</Link>
                {access.canUpdate && item.status === "ACTIVE" ? (
                  <details>
                    <summary>ایجاد نسخه جدید</summary>
                    <RecoverableMutationForm action={updateJobClassification} className="org-professional-form">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="jobProfileId" value={item.jobProfileId} />
                      <label>
                        <span>خانواده</span>
                        <select name="familyId" defaultValue={item.familyId}>
                          {families
                            .filter((f) => f.status === "ACTIVE")
                            .map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label>
                        <span>دسته</span>
                        <select name="categoryId" defaultValue={item.categoryId ?? ""}>
                          <option value="">بدون دسته</option>
                          {families.flatMap((f) =>
                            f.categories
                              .filter((c) => c.status === "ACTIVE")
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  {f.name} / {c.name}
                                </option>
                              )),
                          )}
                        </select>
                      </label>
                      <label>
                        <span>سطح</span>
                        <select name="levelId" defaultValue={item.levelId}>
                          {levels
                            .filter((l) => l.status === "ACTIVE")
                            .map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.name}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label>
                        <span>تاریخ اثرگذاری</span>
                        <input name="effectiveDate" type="date" defaultValue={item.effectiveDate.slice(0, 10)} required />
                      </label>
                      <label>
                        <span>دلیل</span>
                        <input name="reason" required />
                      </label>
                      <button type="submit">ایجاد نسخه {item.version + 1}</button>
                    </RecoverableMutationForm>
                  </details>
                ) : null}
                {access.canArchive && item.status === "ACTIVE" ? (
                  <RecoverableMutationForm action={archiveJobClassification}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit">آرشیو</button>
                  </RecoverableMutationForm>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
      {access.canCreate || access.canUpdate || access.canArchive ? (
        <section className="org-profile-card">
          <h2>مدیریت سلسله‌مراتب</h2>
          <div className="module-page-grid">
            {access.canCreate ? <FamilyCreate /> : null}
            {access.canCreate ? <CategoryCreate families={families} /> : null}
            {access.canCreate ? <LevelCreate /> : null}
          </div>
          <div className="module-page-grid">
            {families.map((family) => (
              <FamilyCard key={family.id} family={family} canUpdate={access.canUpdate} canArchive={access.canArchive} />
            ))}
            {levels.map((level) => (
              <LevelCard key={level.id} level={level} canUpdate={access.canUpdate} canArchive={access.canArchive} />
            ))}
          </div>
        </section>
      ) : null}
      <section className="org-profile-card">
        <h2>معیارهای ارزیابی</h2>
        <p>
          جمع وزن معیارهای فعال باید پیش از اجرای ارزیابی دقیقاً ۱۰۰ باشد. جمع فعلی: <strong>{totalWeight}</strong>
        </p>
        {access.canManageEvaluation ? (
          <RecoverableMutationForm action={saveJobEvaluationCriterion} className="org-professional-form">
            <label>
              <span>نام معیار</span>
              <input name="title" required maxLength={160} />
            </label>
            <label>
              <span>شرح</span>
              <input name="description" />
            </label>
            <label>
              <span>وزن</span>
              <input name="weight" type="number" min="0" max="100" required />
            </label>
            <label>
              <span>حداکثر امتیاز</span>
              <input name="maxScore" type="number" min="1" max="1000" defaultValue="100" required />
            </label>
            <button type="submit">افزودن معیار</button>
          </RecoverableMutationForm>
        ) : null}
        <div className="module-page-grid">
          {criteria.map((item) => (
            <article className="module-grid-card" key={item.id}>
              <h3>{item.title}</h3>
              <p>
                {item.description ?? "بدون شرح"} · وزن {item.weight} · سقف {item.maxScore}
              </p>
              {access.canManageEvaluation && item.status === "ACTIVE" ? (
                <>
                  <details>
                    <summary>ویرایش</summary>
                    <RecoverableMutationForm action={saveJobEvaluationCriterion} className="org-professional-form">
                      <input type="hidden" name="id" value={item.id} />
                      <input name="title" defaultValue={item.title} required />
                      <input name="description" defaultValue={item.description ?? ""} />
                      <input name="weight" type="number" min="0" max="100" defaultValue={item.weight} required />
                      <input name="maxScore" type="number" min="1" max="1000" defaultValue={item.maxScore} required />
                      <button type="submit">ذخیره</button>
                    </RecoverableMutationForm>
                  </details>
                  <RecoverableMutationForm action={archiveJobEvaluationCriterion}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit">آرشیو معیار</button>
                  </RecoverableMutationForm>
                </>
              ) : null}
            </article>
          ))}
        </div>
        <h3>آخرین نتایج</h3>
        <ul>
          {evaluations.map((item) => (
            <li key={item.id}>
              {item.jobProfile.title}: {item.totalScore ?? "—"} · {item.evaluationLevel ?? "بدون سطح"}
            </li>
          ))}
        </ul>
      </section>
      <section className="org-profile-card">
        <h2>گرید و رتبه</h2>
        {access.canCreate ? (
          <div className="module-page-grid">
            <RecoverableMutationForm action={saveJobGrade} className="module-grid-card org-professional-form">
              <h3>گرید جدید</h3>
              <input name="name" aria-label="نام گرید" placeholder="نام" required />
              <input name="code" aria-label="کد گرید" placeholder="کد" required />
              <input name="sortOrder" aria-label="ترتیب گرید" type="number" min="0" placeholder="ترتیب" required />
              <input name="description" aria-label="شرح گرید" placeholder="شرح" />
              <button type="submit">ایجاد گرید</button>
            </RecoverableMutationForm>
            <RecoverableMutationForm action={saveJobRank} className="module-grid-card org-professional-form">
              <h3>رتبه جدید</h3>
              <select name="gradeId" aria-label="گرید" required>
                <option value="">انتخاب گرید</option>
                {grades
                  .filter((item) => item.status === "ACTIVE")
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
              <input name="name" aria-label="نام رتبه" placeholder="نام" required />
              <input name="code" aria-label="کد رتبه" placeholder="کد" required />
              <input name="sortOrder" aria-label="ترتیب رتبه" type="number" min="0" placeholder="ترتیب" required />
              <input name="description" aria-label="شرح رتبه" placeholder="شرح" />
              <button type="submit">ایجاد رتبه</button>
            </RecoverableMutationForm>
          </div>
        ) : null}
        <div className="module-page-grid">
          {grades.map((grade) => (
            <article className="module-grid-card" key={grade.id}>
              <h3>
                {grade.name} · {grade.code}
              </h3>
              <p>{grade.ranks.map((rank) => rank.name).join("، ") || "بدون رتبه"}</p>
              {access.canArchive && grade.status === "ACTIVE" ? (
                <RecoverableMutationForm action={archiveJobGrade}>
                  <input type="hidden" name="id" value={grade.id} />
                  <button type="submit">آرشیو گرید</button>
                </RecoverableMutationForm>
              ) : null}
            </article>
          ))}
          {ranks
            .filter((rank) => !grades.some((grade) => grade.ranks.some((item) => item.id === rank.id)))
            .map((rank) => (
              <article className="module-grid-card" key={rank.id}>
                <h3>{rank.name}</h3>
                {access.canArchive ? (
                  <RecoverableMutationForm action={archiveJobRank}>
                    <input type="hidden" name="id" value={rank.id} />
                    <button type="submit">آرشیو رتبه</button>
                  </RecoverableMutationForm>
                ) : null}
              </article>
            ))}
        </div>
      </section>
    </div>
  );
}
function FamilyCreate() {
  return (
    <RecoverableMutationForm action={createJobFamily} className="module-grid-card org-professional-form">
      <h3>خانواده جدید</h3>
      <input name="name" placeholder="نام" required />
      <input name="code" placeholder="کد" required />
      <input name="description" placeholder="توضیح" />
      <button type="submit">ایجاد</button>
    </RecoverableMutationForm>
  );
}
function CategoryCreate({ families }: { families: Family[] }) {
  return (
    <RecoverableMutationForm action={createJobCategory} className="module-grid-card org-professional-form">
      <h3>دسته جدید</h3>
      <select name="familyId" required>
        <option value="">خانواده</option>
        {families
          .filter((item) => item.status === "ACTIVE")
          .map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
      </select>
      <input name="name" placeholder="نام" required />
      <input name="code" placeholder="کد" required />
      <button type="submit">ایجاد</button>
    </RecoverableMutationForm>
  );
}
function LevelCreate() {
  return (
    <RecoverableMutationForm action={createJobLevel} className="module-grid-card org-professional-form">
      <h3>سطح جدید</h3>
      <input name="name" placeholder="نام" required />
      <input name="code" placeholder="کد" required />
      <input name="sortOrder" type="number" min="0" placeholder="ترتیب" required />
      <button type="submit">ایجاد</button>
    </RecoverableMutationForm>
  );
}
function FamilyCard({ family, canUpdate, canArchive }: { family: Family; canUpdate: boolean; canArchive: boolean }) {
  return (
    <article className="module-grid-card">
      <h3>
        {family.name} · {family.code}
      </h3>
      <p>{family.categories.map((item) => item.name).join("، ") || "بدون دسته"}</p>
      {canUpdate ? (
        <details>
          <summary>ویرایش</summary>
          <RecoverableMutationForm action={updateJobFamily}>
            <input type="hidden" name="id" value={family.id} />
            <input name="name" defaultValue={family.name} required />
            <input name="code" defaultValue={family.code} required />
            <input name="description" defaultValue={family.description ?? ""} />
            <button type="submit">ذخیره</button>
          </RecoverableMutationForm>
        </details>
      ) : null}
      {canArchive && family.status === "ACTIVE" ? (
        <RecoverableMutationForm action={archiveJobFamily}>
          <input type="hidden" name="id" value={family.id} />
          <button type="submit">آرشیو</button>
        </RecoverableMutationForm>
      ) : null}
      {family.categories.map((category) => (
        <details key={category.id}>
          <summary>{category.name}</summary>
          {canUpdate ? (
            <RecoverableMutationForm action={updateJobCategory}>
              <input type="hidden" name="id" value={category.id} />
              <input type="hidden" name="familyId" value={family.id} />
              <input name="name" defaultValue={category.name} required />
              <input name="code" defaultValue={category.code} required />
              <button type="submit">ذخیره</button>
            </RecoverableMutationForm>
          ) : null}
          {canArchive && category.status === "ACTIVE" ? (
            <RecoverableMutationForm action={archiveJobCategory}>
              <input type="hidden" name="id" value={category.id} />
              <button type="submit">آرشیو</button>
            </RecoverableMutationForm>
          ) : null}
        </details>
      ))}
    </article>
  );
}
function LevelCard({ level, canUpdate, canArchive }: { level: Level; canUpdate: boolean; canArchive: boolean }) {
  return (
    <article className="module-grid-card">
      <h3>
        {level.name} · {level.code}
      </h3>
      <p>ترتیب: {level.sortOrder}</p>
      {canUpdate ? (
        <details>
          <summary>ویرایش</summary>
          <RecoverableMutationForm action={updateJobLevel}>
            <input type="hidden" name="id" value={level.id} />
            <input name="name" defaultValue={level.name} required />
            <input name="code" defaultValue={level.code} required />
            <input name="sortOrder" type="number" defaultValue={level.sortOrder} required />
            <button type="submit">ذخیره</button>
          </RecoverableMutationForm>
        </details>
      ) : null}
      {canArchive && level.status === "ACTIVE" ? (
        <RecoverableMutationForm action={archiveJobLevel}>
          <input type="hidden" name="id" value={level.id} />
          <button type="submit">آرشیو</button>
        </RecoverableMutationForm>
      ) : null}
    </article>
  );
}
