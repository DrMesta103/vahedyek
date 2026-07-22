import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveJobCompensationRange, approveJobEvaluationMapping, rejectJobEvaluationMapping, saveJobCompensationRange } from "../../../lib/job-classification-actions";
import { getJobClassificationAccess, getJobEvaluationAccess } from "../../../lib/organization-unit-access";
import { prisma } from "../../../lib/prisma";
import { RecoverableMutationForm } from "../_components/RecoverableMutationForm";

export default async function JobClassificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await getJobClassificationAccess();
  const evaluationAccess = await getJobEvaluationAccess();
  if (!access.tenantId || !access.canView)
    return (
      <main className="module-page">
        <div className="module-empty-state">
          <h1>دسترسی ندارید</h1>
          <p>مجوز مشاهده طبقه‌بندی شغلی را ندارید.</p>
        </div>
      </main>
    );
  const [classification, grades, events] = await Promise.all([prisma.jobClassification.findFirst({ where: { id, tenantId: access.tenantId }, include: { jobProfile: true, family: true, category: true, level: true, grade: true, rank: true, evaluations: { include: { suggestedLevel: true, suggestedGrade: true, suggestedRank: true, items: { include: { criterion: true } } }, orderBy: { createdAt: "desc" } }, compensationRanges: { include: { grade: true }, orderBy: { effectiveFrom: "desc" } } } }), prisma.jobGrade.findMany({ where: { tenantId: access.tenantId, status: "ACTIVE" }, orderBy: { sortOrder: "asc" } }), prisma.organizationEvent.findMany({ where: { tenantId: access.tenantId, OR: [{ referenceId: id }, { newValue: { path: ["classificationId"], equals: id } }] }, orderBy: { occurredAt: "desc" }, take: 50 })]);
  if (!classification) notFound();
  const latestEvaluation = classification.evaluations[0];
  return (
    <main className="page-stack module-page" dir="rtl">
      <header className="module-page-header">
        <div>
          <p className="module-page-eyebrow">جزئیات طبقه‌بندی</p>
          <h1>{classification.jobProfile.title}</h1>
          <p>
            نسخه {classification.version} · بازنگری پروفایل {classification.jobProfileRevision ?? "ثبت‌نشده"}
          </p>
        </div>
        <div>
          <Link href="/job-classifications">بازگشت</Link> {classification.status === "ACTIVE" && evaluationAccess.canManageEvaluation ? (
            <Link className="calendar-create-submit" href={`/job-classifications/${id}/evaluation`}>
              ارزیابی شغل
            </Link>
          ) : null}
        </div>
      </header>
      <section className="module-page-grid">
        <Info title="خانواده" value={classification.family.name} />
        <Info title="دسته" value={classification.category?.name ?? "بدون دسته"} />
        <Info title="سطح" value={classification.level.name} />
        <Info title="گرید" value={classification.grade?.name ?? "تعیین نشده"} />
        <Info title="رتبه" value={classification.rank?.name ?? "تعیین نشده"} />
        <Info title="اثرگذاری" value={classification.effectiveDate.toLocaleDateString("fa-IR")} />
      </section>
      <section className="org-profile-card">
        <h2>نتیجه ارزیابی</h2>
        {latestEvaluation ? (
          <>
            <p>
              <strong>{latestEvaluation.totalScore?.toString() ?? "—"}</strong> از ۱۰۰ · {latestEvaluation.evaluationLevel ?? "بدون سطح"}
            </p>
            <p>
              پیشنهاد: {latestEvaluation.suggestedLevel?.name ?? "—"} / {latestEvaluation.suggestedGrade?.name ?? "—"} / {latestEvaluation.suggestedRank?.name ?? "—"}
            </p>
            <p>وضعیت: {latestEvaluation.workflowState ?? "LEGACY"}</p>
            {evaluationAccess.canManageEvaluation && latestEvaluation.workflowState === "SCORED" && latestEvaluation.suggestedLevelId ? (
              <>
              <RecoverableMutationForm action={approveJobEvaluationMapping} successMessage="ارزیابی تأیید شد.">
                <input type="hidden" name="evaluationId" value={latestEvaluation.id} />
                <button type="submit">تأیید پیشنهاد ارزیابی</button>
              </RecoverableMutationForm>
              <details><summary>رد ارزیابی</summary><RecoverableMutationForm action={rejectJobEvaluationMapping} successMessage="ارزیابی رد شد."><input type="hidden" name="evaluationId" value={latestEvaluation.id} /><label><span>دلیل رد</span><textarea name="reason" required maxLength={500} /></label><button type="submit">ثبت رد ارزیابی</button></RecoverableMutationForm></details>
              </>
            ) : latestEvaluation.workflowState === "APPROVED" && latestEvaluation.approvedAt ? (
              <p>پیشنهاد در {latestEvaluation.approvedAt.toLocaleDateString("fa-IR")} تأیید شده است.</p>
            ) : latestEvaluation.workflowState === "REJECTED" ? (
              <p>این ارزیابی رد شده و قابل تأیید نیست.</p>
            ) : null}
          </>
        ) : (
          <div className="module-empty-state">
            <p>هنوز ارزیابی‌ای برای این طبقه‌بندی ثبت نشده است.</p>
          </div>
        )}
      </section>
      <section className="org-profile-card">
        <h2>بازه پیشنهادی جبران خدمت</h2>
        <p>این بازه حقوق قطعی کارمند نیست.</p>
        {access.canCreate ? (
          <RecoverableMutationForm action={saveJobCompensationRange} className="org-professional-form" successMessage="بازه جبران خدمت ثبت شد.">
            <input type="hidden" name="classificationId" value={id} />
            <label>
              <span>گرید</span>
              <select name="gradeId" defaultValue={classification.gradeId ?? ""} required>
                <option value="">انتخاب کنید</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>کف مبلغ</span>
              <input name="minimumAmount" type="number" min="0" step="1" required />
            </label>
            <label>
              <span>سقف مبلغ</span>
              <input name="maximumAmount" type="number" min="0" step="1" required />
            </label>
            <label>
              <span>ارز</span>
              <input name="currency" defaultValue="IRR" required maxLength={8} />
            </label>
            <label>
              <span>شروع اعتبار</span>
              <input name="effectiveFrom" type="date" required />
            </label>
            <label>
              <span>پایان اعتبار</span>
              <input name="effectiveTo" type="date" />
            </label>
            <label>
              <span>دلیل</span>
              <input name="reason" required maxLength={500} />
            </label>
            <button type="submit">ثبت بازه</button>
          </RecoverableMutationForm>
        ) : null}
        <div className="module-page-grid">
          {classification.compensationRanges.map((range) => (
            <article className="module-grid-card" key={range.id}>
              <h3>
                {Number(range.minimumAmount).toLocaleString("fa-IR")} تا {Number(range.maximumAmount).toLocaleString("fa-IR")} {range.currency}
              </h3>
              <p>
                {range.grade.name} · از {range.effectiveFrom.toLocaleDateString("fa-IR")}
                {range.effectiveTo ? ` تا ${range.effectiveTo.toLocaleDateString("fa-IR")}` : ""}
              </p>
              <span>{range.status === "ACTIVE" ? "فعال" : "آرشیو"}</span>
              {access.canUpdate && range.status === "ACTIVE" ? <details><summary>ایجاد نسخه جدید</summary><p>نسخه فعلی با ثبت نسخه جدید آرشیو می‌شود؛ ویرایش مستقیم انجام نمی‌شود.</p><RecoverableMutationForm action={saveJobCompensationRange} className="org-professional-form" successMessage="نسخه جدید ثبت و نسخه قبلی آرشیو شد."><input type="hidden" name="id" value={range.id} /><input type="hidden" name="classificationId" value={id} /><label><span>گرید</span><select name="gradeId" defaultValue={range.gradeId} required>{grades.map((grade) => <option key={grade.id} value={grade.id}>{grade.name}</option>)}</select></label><label><span>کف مبلغ</span><input name="minimumAmount" type="number" min="0" step="1" defaultValue={range.minimumAmount.toString()} required /></label><label><span>سقف مبلغ</span><input name="maximumAmount" type="number" min="0" step="1" defaultValue={range.maximumAmount.toString()} required /></label><label><span>ارز</span><input name="currency" defaultValue={range.currency} required maxLength={8} /></label><label><span>تاریخ اثرگذاری نسخه جدید</span><input name="effectiveFrom" type="date" required /></label><label><span>پایان اعتبار</span><input name="effectiveTo" type="date" /></label><label><span>دلیل نسخه جدید</span><input name="reason" required maxLength={500} /></label><button type="submit">ایجاد نسخه جدید</button></RecoverableMutationForm></details> : null}
              {access.canArchive && range.status === "ACTIVE" ? (
                <RecoverableMutationForm action={archiveJobCompensationRange}>
                  <input type="hidden" name="id" value={range.id} />
                  <button type="submit">آرشیو بازه</button>
                </RecoverableMutationForm>
              ) : null}
            </article>
          ))}
        </div>
      </section>
      <section className="org-profile-card">
        <h2>تاریخچه</h2>
        {events.length ? (
          <ul>
            {events.map((item) => (
              <li key={item.id}>
                <strong>{item.description}</strong> · {item.effectiveAt?.toLocaleDateString("fa-IR") ?? item.occurredAt.toLocaleDateString("fa-IR")} {item.reason ? `· ${item.reason}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <div className="module-empty-state">
            <p>رویدادی برای این طبقه‌بندی ثبت نشده است.</p>
          </div>
        )}
      </section>
    </main>
  );
}
function Info({ title, value }: { title: string; value: string }) {
  return (
    <article className="module-grid-card">
      <h2>{title}</h2>
      <strong>{value}</strong>
    </article>
  );
}
