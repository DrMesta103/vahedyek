'use client';

import { BriefcaseBusiness, GraduationCap, MapPin, Plus, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { TaavChoiceChipGroup } from '@repo/ui/taav/forms';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { PanelFormModal, PanelFormModalActions } from '../../../../components/PanelFormModal';
import { computeSupplementalCompleteness } from '../../../../lib/employee-supplemental-fields';
import {
  createEmptyEducationRecord,
  createEmptyJobRecord,
  syncSupplementalLegacyFields,
  type EmployeeEducationRecord,
  type EmployeeJobRecord,
  type EmployeeSupplementalProfile,
} from '../../../../lib/employee-contract-drafts';

type ScalarFieldKey = Exclude<
  keyof EmployeeSupplementalProfile,
  'educationRecords' | 'jobRecords' | 'educationField' | 'educationDegree' | 'jobTitle' | 'firstContractDate'
>;

type FieldConfig = {
  key: ScalarFieldKey;
  label: string;
  type?: 'text' | 'date' | 'gender' | 'select';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  wide?: boolean;
};

type ScalarSection = {
  kind: 'scalar';
  kicker: string;
  title: string;
  description: string;
  icon: ReactNode;
  fields: FieldConfig[];
};

type RecordSection = {
  kind: 'education' | 'job';
  kicker: string;
  title: string;
  description: string;
  icon: ReactNode;
};

type EditorSection = ScalarSection | RecordSection;

const MILITARY_STATUS_OPTIONS = [
  { value: 'معاف', label: 'معاف' },
  { value: 'پایان خدمت', label: 'پایان خدمت' },
  { value: 'مشمول', label: 'مشمول' },
  { value: 'در حال خدمت', label: 'در حال خدمت' },
];

const EDUCATION_DEGREE_OPTIONS = [
  { value: 'دیپلم', label: 'دیپلم' },
  { value: 'کاردانی', label: 'کاردانی' },
  { value: 'کارشناسی', label: 'کارشناسی' },
  { value: 'کارشناسی ارشد', label: 'کارشناسی ارشد' },
  { value: 'دکتری', label: 'دکتری' },
];

const EDITOR_SECTIONS: EditorSection[] = [
  {
    kind: 'scalar',
    kicker: 'اطلاعات شخصی',
    title: 'هویت و مشخصات فردی',
    description: 'اطلاعات پایه هویتی برای بندهای قرارداد و پرونده کارمند.',
    icon: <UserRound className="h-4 w-4" aria-hidden />,
    fields: [
      { key: 'fatherName', label: 'نام پدر', placeholder: 'مثلا محمد' },
      { key: 'birthDate', label: 'تاریخ تولد', type: 'date' },
      { key: 'issuePlace', label: 'محل صدور شناسنامه', placeholder: 'مثلا تهران' },
      { key: 'gender', label: 'جنسیت', type: 'gender' },
    ],
  },
  {
    kind: 'education',
    kicker: 'اطلاعات تحصیلی',
    title: 'سوابق تحصیلی',
    description: 'می‌توانید چند مدرک تحصیلی ثبت کنید.',
    icon: <GraduationCap className="h-4 w-4" aria-hidden />,
  },
  {
    kind: 'job',
    kicker: 'اطلاعات شغلی',
    title: 'سوابق شغلی',
    description: 'می‌توانید چند سابقه شغلی ثبت کنید.',
    icon: <BriefcaseBusiness className="h-4 w-4" aria-hidden />,
  },
  {
    kind: 'scalar',
    kicker: 'اطلاعات نظام وظیفه',
    title: 'وضعیت نظام وظیفه',
    description: 'برای تکمیل بندهای قرارداد و محاسبات مرتبط.',
    icon: <ShieldCheck className="h-4 w-4" aria-hidden />,
    fields: [
      {
        key: 'militaryStatus',
        label: 'وضعیت نظام وظیفه',
        type: 'select',
        options: MILITARY_STATUS_OPTIONS,
        placeholder: 'انتخاب وضعیت',
        wide: true,
      },
    ],
  },
  {
    kind: 'scalar',
    kicker: 'آدرس',
    title: 'آدرس و محل سکونت',
    description: 'آدرس کامل محل سکونت کارمند برای اسناد قرارداد.',
    icon: <MapPin className="h-4 w-4" aria-hidden />,
    fields: [
      { key: 'country', label: 'کشور', placeholder: 'ایران' },
      { key: 'province', label: 'استان', placeholder: 'مثلا فارس' },
      { key: 'city', label: 'شهر', placeholder: 'مثلا شیراز' },
      { key: 'street', label: 'خیابان', placeholder: 'نام خیابان اصلی' },
      { key: 'alley', label: 'کوچه', placeholder: 'کوچه یا خیابان فرعی' },
      { key: 'buildingName', label: 'نام ساختمان', placeholder: 'اختیاری' },
      { key: 'plaque', label: 'پلاک', placeholder: 'مثلا ۱۲' },
      { key: 'floor', label: 'طبقه', placeholder: 'مثلا ۳' },
      { key: 'unit', label: 'واحد', placeholder: 'مثلا ۵' },
      { key: 'postalCode', label: 'کد پستی سکونت', placeholder: '۱۰ رقم', wide: true },
    ],
  },
];

function formatDateInput(value: string) {
  return value ? value.slice(0, 10) : '';
}

function EditorField({
  label,
  type = 'text',
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  type?: FieldConfig['type'];
  value: string;
  options?: FieldConfig['options'];
  placeholder?: string;
  onChange: (next: string) => void;
}) {
  if (type === 'gender') {
    return (
      <TaavChoiceChipGroup
        ariaLabel={label}
        options={[
          { value: 'male', label: 'مرد' },
          { value: 'female', label: 'زن' },
          { value: 'other', label: 'سایر' },
        ]}
        value={value}
        onValueChange={(next) => onChange(Array.isArray(next) ? next[0] ?? '' : next)}
      />
    );
  }

  if (type === 'select') {
    return (
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder ?? 'انتخاب کنید'}</option>
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={type === 'date' ? 'date' : 'text'}
      value={type === 'date' ? formatDateInput(value) : value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function EducationRecordBlock({
  index,
  record,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  record: EmployeeEducationRecord;
  canRemove: boolean;
  onChange: (next: EmployeeEducationRecord) => void;
  onRemove: () => void;
}) {
  return (
    <div className="employee-supplemental-record-block">
      <div className="employee-supplemental-record-head">
        <span className="employee-supplemental-record-index">مدرک {index + 1}</span>
        {canRemove ? (
          <button type="button" className="employee-supplemental-record-remove" onClick={onRemove}>
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            حذف
          </button>
        ) : null}
      </div>
      <div className="employee-supplemental-editor-grid">
        <label className="business-draft-field employee-supplemental-editor-field is-wide">
          <span>رشته تحصیلی</span>
          <EditorField
            label="رشته تحصیلی"
            value={record.field}
            placeholder="مثلا مهندسی کامپیوتر"
            onChange={(field) => onChange({ ...record, field })}
          />
        </label>
        <label className="business-draft-field employee-supplemental-editor-field">
          <span>مدرک تحصیلی</span>
          <EditorField
            label="مدرک تحصیلی"
            type="select"
            value={record.degree}
            options={EDUCATION_DEGREE_OPTIONS}
            placeholder="انتخاب مدرک"
            onChange={(degree) => onChange({ ...record, degree })}
          />
        </label>
      </div>
    </div>
  );
}

function JobRecordBlock({
  index,
  record,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  record: EmployeeJobRecord;
  canRemove: boolean;
  onChange: (next: EmployeeJobRecord) => void;
  onRemove: () => void;
}) {
  return (
    <div className="employee-supplemental-record-block">
      <div className="employee-supplemental-record-head">
        <span className="employee-supplemental-record-index">سابقه {index + 1}</span>
        {canRemove ? (
          <button type="button" className="employee-supplemental-record-remove" onClick={onRemove}>
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            حذف
          </button>
        ) : null}
      </div>
      <div className="employee-supplemental-editor-grid">
        <label className="business-draft-field employee-supplemental-editor-field">
          <span>عنوان شغل</span>
          <EditorField
            label="عنوان شغل"
            value={record.title}
            placeholder="مثلا کارشناس فنی"
            onChange={(title) => onChange({ ...record, title })}
          />
        </label>
        <label className="business-draft-field employee-supplemental-editor-field">
          <span>تاریخ شروع</span>
          <EditorField
            label="تاریخ شروع"
            type="date"
            value={record.startDate}
            onChange={(startDate) => onChange({ ...record, startDate })}
          />
        </label>
      </div>
    </div>
  );
}

export function EmployeeSupplementalProfileEditor({
  open,
  employeeName,
  value,
  employeeMeta,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  employeeName: string;
  value: EmployeeSupplementalProfile;
  employeeMeta?: {
    nationalId?: string | null;
    maritalStatus?: string;
    childrenCount?: number;
  };
  onCancel: () => void;
  onSubmit: (value: EmployeeSupplementalProfile) => void;
}) {
  const [draft, setDraft] = useState<EmployeeSupplementalProfile>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const completion = useMemo(
    () =>
      computeSupplementalCompleteness(draft, {
        nationalId: employeeMeta?.nationalId,
        maritalStatus: employeeMeta?.maritalStatus,
        childrenCount: employeeMeta?.childrenCount,
      }),
    [draft, employeeMeta?.childrenCount, employeeMeta?.maritalStatus, employeeMeta?.nationalId],
  );

  const handleSubmit = () => {
    onSubmit(syncSupplementalLegacyFields(draft));
  };

  return (
    <PanelFormModal
      open={open}
      title="تکمیل مشخصات کارمند"
      lead={`اطلاعات ${employeeName} را در بخش‌های زیر تکمیل کنید تا در قرارداد و پرونده کارمند استفاده شود.`}
      onClose={onCancel}
      footer={
        <PanelFormModalActions submitLabel="ذخیره اطلاعات" onSubmit={handleSubmit} onCancel={onCancel} />
      }
    >
      <div className="business-draft-dialog business-draft-template-dialog employee-supplemental-editor-dialog">
        <div className="employee-supplemental-editor-summary">
          <span className="business-draft-dialog-kicker">پیشرفت تکمیل</span>
          <div className="employee-supplemental-editor-summary-row">
            <strong>{employeeName}</strong>
            <span className={`employee-supplemental-editor-progress${completion >= 70 ? ' is-complete' : ''}`}>
              {completion.toLocaleString('fa-IR')}٪ تکمیل
            </span>
          </div>
        </div>

        {EDITOR_SECTIONS.map((section) => (
          <section key={section.kicker} className="business-draft-dialog-card employee-supplemental-editor-section">
            <div className="business-draft-dialog-card-head">
              <div>
                <span className="business-draft-dialog-kicker">
                  {section.icon}
                  {section.kicker}
                </span>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>
              {section.kind === 'education' ? (
                <button
                  type="button"
                  className="employee-supplemental-record-add"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      educationRecords: [...current.educationRecords, createEmptyEducationRecord()],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  افزودن مدرک
                </button>
              ) : null}
              {section.kind === 'job' ? (
                <button
                  type="button"
                  className="employee-supplemental-record-add"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      jobRecords: [...current.jobRecords, createEmptyJobRecord()],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  افزودن سابقه
                </button>
              ) : null}
            </div>

            {section.kind === 'scalar' ? (
              <div className="employee-supplemental-editor-grid">
                {section.fields.map((field) => (
                  <label
                    key={field.key}
                    className={`business-draft-field employee-supplemental-editor-field${field.wide ? ' is-wide' : ''}`}
                  >
                    <span>{field.label}</span>
                    <EditorField
                      label={field.label}
                      type={field.type}
                      value={String(draft[field.key] ?? '')}
                      options={field.options}
                      placeholder={field.placeholder}
                      onChange={(next) => setDraft((current) => ({ ...current, [field.key]: next }))}
                    />
                  </label>
                ))}
              </div>
            ) : null}

            {section.kind === 'education' ? (
              <div className="employee-supplemental-record-stack">
                {draft.educationRecords.map((record, index) => (
                  <EducationRecordBlock
                    key={record.id}
                    index={index}
                    record={record}
                    canRemove={draft.educationRecords.length > 1}
                    onChange={(next) =>
                      setDraft((current) => ({
                        ...current,
                        educationRecords: current.educationRecords.map((item) => (item.id === record.id ? next : item)),
                      }))
                    }
                    onRemove={() =>
                      setDraft((current) => ({
                        ...current,
                        educationRecords: current.educationRecords.filter((item) => item.id !== record.id),
                      }))
                    }
                  />
                ))}
              </div>
            ) : null}

            {section.kind === 'job' ? (
              <div className="employee-supplemental-record-stack">
                {draft.jobRecords.map((record, index) => (
                  <JobRecordBlock
                    key={record.id}
                    index={index}
                    record={record}
                    canRemove={draft.jobRecords.length > 1}
                    onChange={(next) =>
                      setDraft((current) => ({
                        ...current,
                        jobRecords: current.jobRecords.map((item) => (item.id === record.id ? next : item)),
                      }))
                    }
                    onRemove={() =>
                      setDraft((current) => ({
                        ...current,
                        jobRecords: current.jobRecords.filter((item) => item.id !== record.id),
                      }))
                    }
                  />
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </PanelFormModal>
  );
}
