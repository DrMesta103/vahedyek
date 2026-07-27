import {
  PolicyFieldInput,
  PolicyFieldLabel,
  PolicyFormActions,
} from './PolicyWorkspaceShell';
import { SearchablePolicySelect } from './SearchablePolicySelect';
import type { SplitShiftSegmentRules } from '../../../lib/split-shift-policy';

function SplitSegmentRuleFields({
  prefix,
  segment,
  calculationOptions,
}: {
  prefix: '1' | '2';
  segment: SplitShiftSegmentRules;
  calculationOptions: Array<{ value: string; label: string; hint?: string }>;
}) {
  return (
    <div className="split-shift-segment-rules">
      <div className="split-shift-segment-rules-header">
        <h3>{segment.title}</h3>
        {segment.startTime && segment.endTime ? (
          <p>
            بازه: {segment.startTime} تا {segment.endTime}
          </p>
        ) : null}
      </div>

      <div className="shift-policy-panel-grid">
        <label className="policy-field-stack shift-policy-field">
          <PolicyFieldLabel label="فرجه مجاز ورود" required />
          <div className="shift-policy-control-wrap">
            <PolicyFieldInput
              name={`splitSegment${prefix}EntryGraceMinutes`}
              type="number"
              defaultValue={segment.entryGraceMinutes}
              min={0}
            />
            <span className="shift-policy-unit">دقیقه</span>
          </div>
          <p className="shift-policy-hint">کارمند در این بخش می‌تواند تا این مدت بعد از شروع وارد شود.</p>
        </label>

        <label className="policy-field-stack shift-policy-field">
          <PolicyFieldLabel label="فرجه مجاز خروج" required />
          <div className="shift-policy-control-wrap">
            <PolicyFieldInput
              name={`splitSegment${prefix}ExitGraceMinutes`}
              type="number"
              defaultValue={segment.exitGraceMinutes}
              min={0}
            />
            <span className="shift-policy-unit">دقیقه</span>
          </div>
          <p className="shift-policy-hint">کارمند می‌تواند تا این مدت زودتر از پایان بخش خارج شود.</p>
        </label>

        <label className="policy-field-stack shift-policy-field">
          <PolicyFieldLabel label="نحوه محاسبه تأخیر" required />
          <SearchablePolicySelect
            name={`splitSegment${prefix}DelayCalculationMode`}
            value={segment.delayCalculationMode}
            options={calculationOptions.map((option) => ({ value: option.value, label: option.label }))}
            placeholder="انتخاب"
          />
          <p className="shift-policy-hint">ملایم: فقط مازاد فرجه. سخت‌گیرانه: کل تأخیر.</p>
        </label>

        <label className="policy-field-stack shift-policy-field">
          <PolicyFieldLabel label="نحوه محاسبه تعجیل" required />
          <SearchablePolicySelect
            name={`splitSegment${prefix}EarlyLeaveCalculationMode`}
            value={segment.earlyLeaveCalculationMode}
            options={calculationOptions.map((option) => ({ value: option.value, label: option.label }))}
            placeholder="انتخاب"
          />
          <p className="shift-policy-hint">ملایم: فقط مازاد فرجه. سخت‌گیرانه: کل تعجیل.</p>
        </label>

        <label className="policy-field-stack shift-policy-field">
          <PolicyFieldLabel label="حداکثر تأخیر برای غیبت" required />
          <div className="shift-policy-control-wrap">
            <PolicyFieldInput
              name={`splitSegment${prefix}MaxDelayBeforeAbsenceMinutes`}
              type="number"
              defaultValue={segment.maxDelayBeforeAbsenceMinutes}
              min={0}
            />
            <span className="shift-policy-unit">دقیقه</span>
          </div>
          <p className="shift-policy-hint">اگر تأخیر این بخش از این مقدار بیشتر شود، آن بخش غیبت محسوب می‌شود.</p>
        </label>

        <input type="hidden" name={`splitSegment${prefix}StartTime`} value={segment.startTime ?? ''} />
        <input type="hidden" name={`splitSegment${prefix}EndTime`} value={segment.endTime ?? ''} />
      </div>
    </div>
  );
}

export function SplitShiftPolicyEditor({
  segments,
  calculationOptions,
  backHref,
}: {
  segments: SplitShiftSegmentRules[];
  calculationOptions: Array<{ value: string; label: string; hint?: string }>;
  backHref: string;
}) {
  const [segment1, segment2] = segments;

  return (
    <div className="split-shift-policy-editor">
      {segment1 ? (
        <section className="shift-policy-panel split-shift-segment-panel">
          <SplitSegmentRuleFields prefix="1" segment={segment1} calculationOptions={calculationOptions} />
        </section>
      ) : null}
      {segment2 ? (
        <section className="shift-policy-panel split-shift-segment-panel">
          <SplitSegmentRuleFields prefix="2" segment={segment2} calculationOptions={calculationOptions} />
        </section>
      ) : null}
      <PolicyFormActions cancelHref={backHref} submitLabel="ویرایش" />
    </div>
  );
}
