'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  createDefaultProfileStore,
  DEFAULT_PROFILE_META,
  type BankAccountRecord,
  type BankAccountType,
  type BankAccountUsage,
  type BrandingSettings,
  type OwnershipKind,
  type ProfileMeta,
  type ProfileStore,
} from '../profile.types';
import { fetchProfilePayload, loadProfileStore, persistProfileStore } from '../profileStorage';

const BANK_ACCOUNT_TYPE_OPTIONS: Array<{ label: string; value: BankAccountType }> = [
  { label: 'جاری', value: 'current' },
  { label: 'کوتاه‌مدت', value: 'short' },
  { label: 'بلندمدت', value: 'long' },
  { label: 'وام', value: 'loan' },
  { label: 'ارزی', value: 'foreign' },
];

const BANK_ACCOUNT_USAGE_OPTIONS: Array<{ label: string; value: BankAccountUsage }> = [
  { label: 'اصلی', value: 'primary' },
  { label: 'قرارداد', value: 'contract' },
  { label: 'جریمه', value: 'penalty' },
  { label: 'خسارت دیرکرد', value: 'late-fee' },
  { label: 'اقساط', value: 'installment' },
  { label: 'هزینه پروژه', value: 'project-cost' },
  { label: 'سایر', value: 'other' },
];

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createBankAccount(): BankAccountRecord {
  return {
    id: makeId(),
    bankName: '',
    bankCode: '',
    bankLogoMode: 'text',
    accountNumber: '',
    sheba: '',
    cardNumber: '',
    showInContracts: true,
    ownerName: '',
    owners: [],
    accountType: 'current',
    usage: 'primary',
    title: '',
  };
}

function readFileAsDataUrl(file: File | null): Promise<string> {
  if (!file) return Promise.resolve('');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('file_read_failed'));
    reader.readAsDataURL(file);
  });
}

function Field({
  label,
  children,
  fullSpan,
}: {
  label: string;
  children: ReactNode;
  fullSpan?: boolean;
}) {
  return (
    <label className={fullSpan ? 'full-span' : undefined}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function UploadCard({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: string;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="profile-summary-card" style={{ minHeight: 260 }}>
      <div className="dashboard-spotlight-head">
        <div>
          <p className="eyebrow">{title}</p>
          <h3>{value ? 'فایل بارگذاری شده' : 'فایل انتخاب نشده'}</h3>
        </div>
        <div className="inline-actions">
          <button type="button" className="secondary-button" onClick={() => inputRef.current?.click()}>
            انتخاب فایل
          </button>
          <button type="button" className="secondary-button" onClick={() => onChange(null)}>
            پاک کردن
          </button>
        </div>
      </div>

      <p>{description}</p>

      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: 140,
          borderRadius: 18,
          border: '1px dashed var(--line)',
          background: 'rgba(255,255,255,0.03)',
          overflow: 'hidden',
        }}
      >
        {value ? (
          <img
            src={value}
            alt={title}
            style={{ width: '100%', height: 140, objectFit: 'contain', padding: 12 }}
          />
        ) : (
          <span className="muted">هنوز فایلی ثبت نشده است</span>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
    </div>
  );
}

function summarizeOwners(owners: string[]) {
  if (!owners.length) return 'ثبت نشده';
  return owners.join('، ');
}

export default function BusinessProfileAccountPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<ProfileStore>(createDefaultProfileStore());
  const [meta, setMeta] = useState<ProfileMeta>(DEFAULT_PROFILE_META);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState<null | 'ownership' | 'bankAccounts' | 'branding'>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const payload = await fetchProfilePayload();
        if (!mounted) return;
        setStore(payload.store);
        setMeta(payload.meta);
      } catch (error) {
        if (!mounted) return;
        if (error instanceof Error && error.message === 'unauthorized') {
          router.replace('/select-tenant?next=%2Faccount');
          return;
        }

        setStore(loadProfileStore());
        setMeta(DEFAULT_PROFILE_META);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [router]);

  const businessName =
    store.ownership.companyName.trim() ||
    store.ownership.brandName.trim() ||
    meta.businessName.trim() ||
    'دسترنج';

  const ownerLabel = meta.owner.fullName || 'ثبت نشده';
  const summaryBadgeLabel = store.ownership.ownershipKind === 'legal' ? 'حقوقی' : 'حقیقی';
  const summaryBadgeStyle =
    store.ownership.ownershipKind === 'legal'
      ? { background: 'rgba(20, 184, 166, 0.14)', color: '#4fd1c5' }
      : { background: 'rgba(56, 189, 248, 0.14)', color: '#7dd3fc' };

  const updateOwnership = (patch: Partial<ProfileStore['ownership']>) => {
    setStore((current) => ({
      ...current,
      ownership: {
        ...current.ownership,
        ...patch,
      },
    }));
  };

  const updateBankAccount = (accountId: string, patch: Partial<BankAccountRecord>) => {
    setStore((current) => ({
      ...current,
      bankAccounts: current.bankAccounts.map((account) => (account.id === accountId ? { ...account, ...patch } : account)),
    }));
  };

  const saveStore = async (section: 'ownership' | 'bankAccounts' | 'branding') => {
    setSaving(section);
    setNotice('');
    try {
      const saved = await persistProfileStore(store);
      setStore(saved);
      setNotice('اطلاعات با موفقیت ثبت شد.');
    } catch (error) {
      if (error instanceof Error && error.message === 'unauthorized') {
        router.replace('/select-tenant?next=%2Faccount');
        return;
      }
      setNotice('ثبت اطلاعات ناموفق بود.');
    } finally {
      setSaving(null);
    }
  };

  const setBranding = (patch: Partial<BrandingSettings>) => {
    setStore((current) => ({
      ...current,
      branding: {
        ...current.branding,
        ...patch,
      },
    }));
  };

  if (loading) {
    return (
      <div className="profile-summary-card">
        <p className="muted">در حال بارگذاری پروفایل کسب‌وکار...</p>
      </div>
    );
  }

  return (
    <section className="page-stack">
      {notice ? <div className="profile-summary-card">{notice}</div> : null}

      <section className="dashboard-grid">
        <article className="profile-summary-card">
          <div className="dashboard-spotlight-head">
            <div>
              <p className="eyebrow">پروفایل کسب‌وکار دسترنج</p>
              <h3>{businessName}</h3>
            </div>
            <span className="status-chip" style={summaryBadgeStyle}>
              {summaryBadgeLabel}
            </span>
          </div>

          <p>فقط سه بخش فعال است: نوع مالکیت و اطلاعات پایه، شماره حساب‌ها، و لوگو / مهر.</p>

          <div className="detail-grid">
            <div>
              <span>مالک tenant</span>
              <strong>{ownerLabel}</strong>
            </div>
            <div>
              <span>کد برند</span>
              <strong>{meta.brandCode || 'DS'}</strong>
            </div>
            <div>
              <span>نام نمایشی</span>
              <strong>{businessName}</strong>
            </div>
            <div>
              <span>شماره حساب‌ها</span>
              <strong>{store.bankAccounts.length || 0}</strong>
            </div>
          </div>
        </article>

        <article className="profile-summary-card profile-summary-accent">
          <p className="eyebrow">وضعیت ذخیره‌سازی</p>
          <h3>داده‌ها برای همین tenant ذخیره می‌شوند</h3>
          <p>
            اگر tenant فعال نباشد، صفحه به انتخاب tenant برمی‌گردد. همه‌ی تغییرات این صفحه به صورت JSON ذخیره می‌شوند و
            فقط همین سه بخش را نگه می‌دارند.
          </p>
        </article>
      </section>

      <div className="dual-grid">
        <article className="profile-summary-card">
          <div className="dashboard-spotlight-head">
            <div>
              <p className="eyebrow">نوع مالکیت و اطلاعات پایه</p>
              <h3>تنظیمات اصلی کسب‌وکار</h3>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                updateOwnership({
                  ownershipKind: store.ownership.ownershipKind === 'legal' ? 'natural' : 'legal',
                })
              }
            >
              {store.ownership.ownershipKind === 'legal' ? 'انتقال به حقیقی' : 'انتقال به حقوقی'}
            </button>
          </div>

          <div className="form-grid">
            <Field label="نوع مالکیت">
              <select
                value={store.ownership.ownershipKind}
                onChange={(event) => updateOwnership({ ownershipKind: event.target.value as OwnershipKind })}
              >
                <option value="legal">حقوقی</option>
                <option value="natural">حقیقی</option>
              </select>
            </Field>

            <Field label="نام برند">
              <input
                value={store.ownership.brandName}
                onChange={(event) => updateOwnership({ brandName: event.target.value })}
                placeholder="دسترنج"
              />
            </Field>

            <Field label="نام ثبت‌شده">
              <input
                value={store.ownership.legalName}
                onChange={(event) => updateOwnership({ legalName: event.target.value })}
                placeholder="نام حقوقی یا مالک"
              />
            </Field>

            {store.ownership.ownershipKind === 'legal' ? (
              <>
                <Field label="نوع شخصیت">
                  <input
                    value={store.ownership.legalType}
                    onChange={(event) => updateOwnership({ legalType: event.target.value })}
                  />
                </Field>

                <Field label="نام شرکت">
                  <input
                    value={store.ownership.companyName}
                    onChange={(event) => updateOwnership({ companyName: event.target.value })}
                    placeholder="نام شرکت"
                  />
                </Field>

                <Field label="شماره ثبت">
                  <input
                    value={store.ownership.registrationNumber}
                    onChange={(event) => updateOwnership({ registrationNumber: event.target.value })}
                  />
                </Field>

                <Field label="شناسه ملی">
                  <input
                    value={store.ownership.nationalId}
                    onChange={(event) => updateOwnership({ nationalId: event.target.value })}
                  />
                </Field>
              </>
            ) : null}

            <Field label="کد اقتصادی">
              <input
                value={store.ownership.economicCode}
                onChange={(event) => updateOwnership({ economicCode: event.target.value })}
              />
            </Field>

            <Field label="کد مالیاتی">
              <input
                value={store.ownership.taxFileNumber}
                onChange={(event) => updateOwnership({ taxFileNumber: event.target.value })}
              />
            </Field>

            {store.ownership.ownershipKind === 'legal' ? (
              <Field label="تاریخ ثبت">
                <input
                  value={store.ownership.registrationDate}
                  onChange={(event) => updateOwnership({ registrationDate: event.target.value })}
                  placeholder="1404/01/01"
                />
              </Field>
            ) : null}
          </div>

          <div className="inline-actions">
            <button type="button" className="primary-button" onClick={() => saveStore('ownership')} disabled={saving === 'ownership'}>
              {saving === 'ownership' ? 'در حال ثبت...' : 'ثبت اطلاعات پایه'}
            </button>
          </div>
        </article>

        <article className="profile-summary-card">
          <div className="dashboard-spotlight-head">
            <div>
              <p className="eyebrow">شماره حساب</p>
              <h3>حساب‌های بانکی</h3>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setStore((current) => ({
                  ...current,
                  bankAccounts: [createBankAccount(), ...current.bankAccounts],
                }))
              }
            >
              افزودن حساب
            </button>
          </div>

          <div className="stack">
            {store.bankAccounts.length ? (
              store.bankAccounts.map((account, index) => (
                <div key={account.id} className="profile-summary-card" style={{ padding: 14 }}>
                <div className="dashboard-spotlight-head">
                  <div>
                    <p className="eyebrow">حساب #{index + 1}</p>
                    <h3>{account.title || 'عنوان حساب'}</h3>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      setStore((current) => ({
                        ...current,
                        bankAccounts: current.bankAccounts.filter((item) => item.id !== account.id),
                      }))
                    }
                  >
                    حذف
                  </button>
                </div>

                <div className="form-grid">
                  <Field label="عنوان" fullSpan>
                    <input
                      value={account.title}
                      onChange={(event) => updateBankAccount(account.id, { title: event.target.value })}
                    />
                  </Field>

                  <Field label="نام بانک">
                    <input
                      value={account.bankName}
                      onChange={(event) => updateBankAccount(account.id, { bankName: event.target.value })}
                    />
                  </Field>

                  <Field label="کد بانک">
                    <input
                      value={account.bankCode}
                      onChange={(event) => updateBankAccount(account.id, { bankCode: event.target.value })}
                    />
                  </Field>

                  <Field label="نوع حساب">
                    <select
                      value={account.accountType}
                      onChange={(event) => updateBankAccount(account.id, { accountType: event.target.value as BankAccountType })}
                    >
                      {BANK_ACCOUNT_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="کاربری">
                    <select
                      value={account.usage}
                      onChange={(event) => updateBankAccount(account.id, { usage: event.target.value as BankAccountUsage })}
                    >
                      {BANK_ACCOUNT_USAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="شماره حساب">
                    <input
                      value={account.accountNumber}
                      onChange={(event) => updateBankAccount(account.id, { accountNumber: event.target.value })}
                      dir="ltr"
                    />
                  </Field>

                  <Field label="شبا" fullSpan>
                    <input
                      value={account.sheba}
                      onChange={(event) => updateBankAccount(account.id, { sheba: event.target.value })}
                      dir="ltr"
                    />
                  </Field>

                  <Field label="شماره کارت">
                    <input
                      value={account.cardNumber}
                      onChange={(event) => updateBankAccount(account.id, { cardNumber: event.target.value })}
                      dir="ltr"
                    />
                  </Field>

                  <Field label="لوگوی بانک">
                    <select
                      value={account.bankLogoMode}
                      onChange={(event) => updateBankAccount(account.id, { bankLogoMode: event.target.value as 'text' | 'badge' })}
                    >
                      <option value="text">متنی</option>
                      <option value="badge">نشان</option>
                    </select>
                  </Field>

                  <Field label="صاحبان حساب" fullSpan>
                    <input
                      value={account.owners.join('، ')}
                      onChange={(event) =>
                        updateBankAccount(account.id, {
                          owners: event.target.value
                            .split('،')
                            .map((item) => item.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </Field>

                  <label className="checkbox-row full-span">
                    <input
                      type="checkbox"
                      checked={account.showInContracts}
                      onChange={(event) => updateBankAccount(account.id, { showInContracts: event.target.checked })}
                    />
                    <span>در قراردادها نمایش داده شود</span>
                  </label>
                </div>

                <div className="detail-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', marginTop: 12 }}>
                  <div>
                    <span>وضعیت نمایش</span>
                    <strong>{account.showInContracts ? 'فعال' : 'غیرفعال'}</strong>
                  </div>
                  <div>
                    <span>مالکین</span>
                    <strong>{summarizeOwners(account.owners)}</strong>
                  </div>
                </div>
                </div>
              ))
            ) : (
              <div className="profile-summary-card" style={{ padding: 14 }}>
                <p className="muted">هنوز هیچ حسابی ثبت نشده است. از دکمه «افزودن حساب» استفاده کنید.</p>
              </div>
            )}
          </div>

          <div className="inline-actions">
            <button type="button" className="primary-button" onClick={() => saveStore('bankAccounts')} disabled={saving === 'bankAccounts'}>
              {saving === 'bankAccounts' ? 'در حال ثبت...' : 'ثبت شماره حساب‌ها'}
            </button>
          </div>
        </article>
      </div>

      <article className="profile-summary-card">
        <div className="dashboard-spotlight-head">
          <div>
            <p className="eyebrow">لوگو و مهر</p>
            <h3>فقط دو فایل برندینگ</h3>
          </div>
          <button type="button" className="secondary-button" onClick={() => saveStore('branding')} disabled={saving === 'branding'}>
            {saving === 'branding' ? 'در حال ثبت...' : 'ثبت برندینگ'}
          </button>
        </div>

        <div className="dual-grid">
          <UploadCard
            title="لوگوی رسمی"
            description="این تصویر در سربرگ‌ها و نمایش‌های برند استفاده می‌شود."
            value={store.branding.logoImage}
            onChange={async (file) => {
              const dataUrl = await readFileAsDataUrl(file);
              setBranding({ logoImage: dataUrl });
            }}
          />
          <UploadCard
            title="مهر رسمی"
            description="این تصویر برای خروجی‌های رسمی و قراردادها استفاده می‌شود."
            value={store.branding.sealImage}
            onChange={async (file) => {
              const dataUrl = await readFileAsDataUrl(file);
              setBranding({ sealImage: dataUrl });
            }}
          />
        </div>
      </article>
    </section>
  );
}
