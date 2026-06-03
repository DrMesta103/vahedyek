'use client';

import { Building2, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { PanelFormModal, PanelFormModalActions } from '../../../components/PanelFormModal';
import { createDefaultProfileStore, type ProfileMeta, type ProfileStore } from '../profile.types';

const LEGAL_TYPE_OPTIONS = [
  'شرکت سهامی خاص',
  'شرکت سهامی عام',
  'شرکت با مسئولیت محدود',
  'شرکت تضامنی',
  'شرکت تعاونی',
] as const;

function formatDateInput(value: string) {
  return value ? value.slice(0, 10) : '';
}

function EditorField({
  value,
  type = 'text',
  placeholder,
  onChange,
}: {
  value: string;
  type?: 'text' | 'date';
  placeholder?: string;
  onChange: (next: string) => void;
}) {
  return (
    <input
      type={type === 'date' ? 'date' : 'text'}
      value={type === 'date' ? formatDateInput(value) : value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function EditorFieldLabel({
  label,
  required,
  children,
  wide,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`business-draft-field employee-supplemental-editor-field${wide ? ' is-wide' : ''}`}>
      <span>
        {label}
        {required ? <em> *</em> : null}
      </span>
      {children}
    </label>
  );
}

export function isFirstPartyProfileComplete(store: ProfileStore, meta: ProfileMeta) {
  const ownerName = meta.owner.fullName.trim();
  const phoneOrEmail = (meta.owner.mobile || meta.owner.email || '').trim();

  if (store.ownership.ownershipKind === 'natural') {
    return Boolean(ownerName && phoneOrEmail);
  }

  return Boolean(store.ownership.nationalId.trim() && store.ownership.economicCode.trim() && ownerName);
}

export function BusinessOwnershipProfileEditor({
  open,
  store: initialStore,
  meta: initialMeta,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  store: ProfileStore;
  meta: ProfileMeta;
  onCancel: () => void;
  onSubmit: (payload: { store: ProfileStore; meta: ProfileMeta }) => void | Promise<void>;
}) {
  const [store, setStore] = useState(initialStore);
  const [owner, setOwner] = useState(initialMeta.owner);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStore(initialStore);
    setOwner(initialMeta.owner);
  }, [open, initialStore, initialMeta]);

  const updateOwnership = (patch: Partial<ProfileStore['ownership']>) => {
    setStore((current) => ({
      ...current,
      ownership: {
        ...current.ownership,
        ...patch,
      },
    }));
  };

  const isComplete = useMemo(
    () => isFirstPartyProfileComplete(store, { ...initialMeta, owner }),
    [initialMeta, owner, store],
  );

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit({
        store,
        meta: { ...initialMeta, owner },
      });
    } finally {
      setSaving(false);
    }
  };

  const ownershipKind = store.ownership.ownershipKind;

  return (
    <PanelFormModal
      open={open}
      title="تکمیل اطلاعات کارفرما"
      lead="اطلاعات طرف اول قرارداد را مطابق پروفایل کسب‌وکار تکمیل کنید."
      onClose={onCancel}
      footer={
        <PanelFormModalActions
          submitLabel="ذخیره اطلاعات"
          saving={saving}
          onSubmit={() => void handleSubmit()}
          onCancel={onCancel}
        />
      }
    >
      <div className="business-draft-dialog business-draft-template-dialog business-ownership-editor-dialog">
        <div className="employee-supplemental-editor-summary">
          <span className="business-draft-dialog-kicker">وضعیت تکمیل</span>
          <div className="employee-supplemental-editor-summary-row">
            <strong>{ownershipKind === 'legal' ? 'شخص حقوقی' : 'شخص حقیقی'}</strong>
            <span className={`employee-supplemental-editor-progress${isComplete ? ' is-complete' : ''}`}>
              {isComplete ? 'آماده استفاده در قرارداد' : 'نیاز به تکمیل'}
            </span>
          </div>
        </div>

        <section className="business-draft-dialog-card employee-supplemental-editor-section">
          <div className="business-draft-dialog-card-head">
            <div>
              <span className="business-draft-dialog-kicker">
                <UserRound className="h-4 w-4" aria-hidden />
                مالک / نماینده
              </span>
              <h3>اطلاعات مالک کسب‌وکار</h3>
              <p>
                {ownershipKind === 'legal'
                  ? 'نام نماینده قانونی در قراردادهای رسمی استفاده می‌شود.'
                  : 'برای شخص حقیقی، نام و راه ارتباطی مالک در قرارداد درج می‌شود.'}
              </p>
            </div>
          </div>

          <div className="employee-supplemental-editor-grid">
            <EditorFieldLabel
              label={ownershipKind === 'legal' ? 'نام نماینده قانونی' : 'نام و نام خانوادگی'}
              required
              wide
            >
              <EditorField value={owner.fullName} onChange={(value) => setOwner((current) => ({ ...current, fullName: value }))} />
            </EditorFieldLabel>
            <EditorFieldLabel label="موبایل" required={ownershipKind === 'natural'}>
              <EditorField
                value={owner.mobile ?? ''}
                placeholder="مثلا 09123456789"
                onChange={(value) => setOwner((current) => ({ ...current, mobile: value.trim() || null }))}
              />
            </EditorFieldLabel>
            <EditorFieldLabel label="ایمیل">
              <EditorField
                value={owner.email ?? ''}
                placeholder="example@email.com"
                onChange={(value) => setOwner((current) => ({ ...current, email: value.trim() || null }))}
              />
            </EditorFieldLabel>
          </div>
        </section>

        {ownershipKind === 'legal' ? (
          <section className="business-draft-dialog-card employee-supplemental-editor-section">
            <div className="business-draft-dialog-card-head">
              <div>
                <span className="business-draft-dialog-kicker">
                  <Building2 className="h-4 w-4" aria-hidden />
                  اطلاعات حقوقی
                </span>
                <h3>مشخصات شرکت</h3>
                <p>شناسه‌ها و اطلاعات ثبتی شرکت برای بندهای قرارداد کارفرما.</p>
              </div>
            </div>

            <div className="business-ownership-legal-type-field">
              <span className="business-ownership-legal-type-label">نوع شخصیت حقوقی</span>
              <div className="business-ownership-legal-type-row" role="radiogroup" aria-label="نوع شخصیت حقوقی">
                {LEGAL_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={store.ownership.legalType === option}
                    className={store.ownership.legalType === option ? 'is-selected' : ''}
                    onClick={() => updateOwnership({ legalType: option })}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="employee-supplemental-editor-grid">
              <EditorFieldLabel label="نام تجاری / برند" required>
                <EditorField value={store.ownership.brandName} onChange={(value) => updateOwnership({ brandName: value })} />
              </EditorFieldLabel>
              <EditorFieldLabel label="شناسه ملی" required>
                <EditorField value={store.ownership.nationalId} onChange={(value) => updateOwnership({ nationalId: value })} />
              </EditorFieldLabel>
              <EditorFieldLabel label="کد اقتصادی" required>
                <EditorField value={store.ownership.economicCode} onChange={(value) => updateOwnership({ economicCode: value })} />
              </EditorFieldLabel>
              <EditorFieldLabel label="شماره ثبت شرکت">
                <EditorField
                  value={store.ownership.registrationNumber}
                  onChange={(value) => updateOwnership({ registrationNumber: value })}
                />
              </EditorFieldLabel>
              <EditorFieldLabel label="تاریخ ثبت شرکت">
                <EditorField
                  type="date"
                  value={store.ownership.registrationDate}
                  onChange={(value) => updateOwnership({ registrationDate: value })}
                />
              </EditorFieldLabel>
              <EditorFieldLabel label="شماره پرونده مالیاتی">
                <EditorField value={store.ownership.taxFileNumber} onChange={(value) => updateOwnership({ taxFileNumber: value })} />
              </EditorFieldLabel>
            </div>
          </section>
        ) : (
          <section className="business-draft-dialog-card employee-supplemental-editor-section">
            <div className="business-draft-dialog-card-head">
              <div>
                <span className="business-draft-dialog-kicker">
                  <Building2 className="h-4 w-4" aria-hidden />
                  اطلاعات حقیقی
                </span>
                <h3>شناسه‌های مالیاتی</h3>
                <p>برای شخص حقیقی، شناسه‌های مالیاتی در صورت وجود ثبت می‌شود.</p>
              </div>
            </div>

            <div className="employee-supplemental-editor-grid">
              <EditorFieldLabel label="شماره پرونده مالیاتی">
                <EditorField value={store.ownership.taxFileNumber} onChange={(value) => updateOwnership({ taxFileNumber: value })} />
              </EditorFieldLabel>
              <EditorFieldLabel label="کد اقتصادی">
                <EditorField value={store.ownership.economicCode} onChange={(value) => updateOwnership({ economicCode: value })} />
              </EditorFieldLabel>
            </div>
          </section>
        )}
      </div>
    </PanelFormModal>
  );
}

export function createOwnershipEditorDefaults() {
  return {
    store: createDefaultProfileStore(),
    meta: {
      businessName: '',
      slug: '',
      brandCode: 'DS',
      packageKey: 'starter',
      billingCycle: 'monthly',
      createdAt: null,
      owner: {
        fullName: '',
        mobile: null,
        email: null,
      },
    } satisfies ProfileMeta,
  };
}
