"use client";
import { useMemo, useState } from "react";
import { createJobEvaluation } from "../../../../lib/job-classification-actions";
import { RecoverableMutationForm } from "../../_components/RecoverableMutationForm";

type Criterion = { id: string; title: string; description: string | null; weight: number; maxScore: number };
type Option = { id: string; name: string; gradeId?: string };
export function EvaluationForm({ classificationId, criteria, levels, grades, ranks }: { classificationId: string; criteria: Criterion[]; levels: Option[]; grades: Option[]; ranks: Option[] }) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [gradeId, setGradeId] = useState("");
  const totalWeight = criteria.reduce((sum, item) => sum + item.weight, 0);
  const preview = useMemo(() => criteria.reduce((sum, item) => sum + ((scores[item.id] ?? 0) / item.maxScore) * item.weight, 0), [criteria, scores]);
  const level = preview >= 85 ? "ممتاز" : preview >= 70 ? "بالا" : preview >= 50 ? "میانی" : "نیازمند بازنگری";
  return (
    <RecoverableMutationForm action={createJobEvaluation} className="page-stack" successMessage="ارزیابی ذخیره شد.">
      <input type="hidden" name="classificationId" value={classificationId} />
      <section className="org-profile-card">
        <h2>معیارها و امتیازها</h2>
        <p role="status">جمع وزن فعال: {totalWeight} از ۱۰۰</p>
        {criteria.map((criterion) => (
          <fieldset className="module-grid-card" key={criterion.id}>
            <legend>{criterion.title}</legend>
            <p>
              {criterion.description ?? "بدون شرح"} · وزن {criterion.weight} · دامنه ۰ تا {criterion.maxScore}
            </p>
            <label>
              <span>امتیاز</span>
              <input name={`score_${criterion.id}`} type="number" min="0" max={criterion.maxScore} step="0.01" required onChange={(event) => setScores((current) => ({ ...current, [criterion.id]: Number(event.target.value) }))} />
            </label>
            <label>
              <span>مستند یا دلیل</span>
              <textarea name={`evidence_${criterion.id}`} required maxLength={1000} />
            </label>
          </fieldset>
        ))}
      </section>
      <section className="org-profile-card">
        <h2>پیشنهاد طبقه‌بندی</h2>
        <p>این انتخاب پیشنهاد است و تا تأیید مستقل، طبقه‌بندی را تغییر نمی‌دهد.</p>
        <div className="org-professional-form">
          <label>
            <span>سطح پیشنهادی</span>
            <select name="suggestedLevelId" required>
              <option value="">انتخاب کنید</option>
              {levels.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>گرید پیشنهادی</span>
            <select name="suggestedGradeId" value={gradeId} onChange={(event) => setGradeId(event.target.value)}>
              <option value="">بدون پیشنهاد</option>
              {grades.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>رتبه پیشنهادی</span>
            <select name="suggestedRankId">
              <option value="">بدون پیشنهاد</option>
              {ranks
                .filter((item) => !gradeId || item.gradeId === gradeId)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span>تاریخ اثرگذاری</span>
            <input name="effectiveAt" type="date" required />
          </label>
          <label>
            <span>دلیل ارزیابی</span>
            <textarea name="reason" required maxLength={500} />
          </label>
        </div>
      </section>
      <section className="org-profile-card" aria-live="polite">
        <h2>پیش‌نمایش نتیجه</h2>
        <p>
          <strong>{preview.toFixed(2)}</strong> از ۱۰۰ · {level}
        </p>
        <button type="submit" disabled={totalWeight !== 100}>
          ذخیره ارزیابی
        </button>
        {totalWeight !== 100 ? <p role="alert">تا زمانی که مجموع وزن معیارهای فعال ۱۰۰ نباشد، ذخیره ممکن نیست.</p> : null}
      </section>
    </RecoverableMutationForm>
  );
}
