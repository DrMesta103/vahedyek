'use client';

import Link from 'next/link';
import { ArrowRight, Building2, CircleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createDefaultProfileStore,
  DEFAULT_PROFILE_META,
  type BankAccountRecord,
  type BankAccountType,
  type BankAccountUsage,
  type ProfileMeta,
  type ProfileStore,
} from '../profile.types';
import { addBankAccount, fetchProfilePayload, fetchProfileStore, loadProfileStore, persistProfileStore, updateBankAccount } from '../profileStorage';
import { BUSINESS_PROFILE_BANK_ACCOUNTS, getSelectTenantPath } from '../routes';
import { LoadingCard } from './account-ui';
import {
  ProfileCard,
  ProfileChipGroup,
  ProfileHeading,
  ProfilePageShell,
  ProfileSubmitBar,
  ProfileTextField,
} from './ProfileFormShell';

type ContractVisibility = 'show' | 'hide';

const accountTypeOptions: Array<{ value: BankAccountType; label: string }> = [
  { value: 'current', label: 'جاری' },
  { value: 'short', label: 'کوتاه‌مدت' },
  { value: 'long', label: 'بلندمدت' },
  { value: 'loan', label: 'قرض‌الحسنه' },
  { value: 'foreign', label: 'ارزی' },
];

const usageOptions: Array<{ value: BankAccountUsage; label: string }> = [
  { value: 'primary', label: 'حساب اصلی' },
  { value: 'contract', label: 'حساب قرارداد' },
  { value: 'penalty', label: 'حساب جرائم' },
  { value: 'late-fee', label: 'حساب صندوق' },
  { value: 'installment', label: 'حساب بانک' },
  { value: 'shareholders', label: 'حساب سهامداران' },
  { value: 'project-cost', label: 'حساب هزینه پروژه' },
  { value: 'other', label: 'سایر' },
];

const visibilityOptions: Array<{ value: ContractVisibility; label: string }> = [
  { value: 'show', label: 'نمایش در قراردادها' },
  { value: 'hide', label: 'عدم نمایش در قراردادها' },
];

const titleSuggestions: Record<BankAccountUsage, string[]> = {
  primary: ['حساب اصلی پرداخت‌ها', 'حساب اصلی کسب‌وکار'],
  contract: ['حساب قراردادهای پرسنلی', 'حساب دریافت قراردادها'],
  penalty: ['حساب دریافت جرائم', 'حساب جرائم قراردادی'],
  'late-fee': ['حساب صندوق', 'حساب خسارت دیرکرد'],
  installment: ['حساب بانک', 'حساب اقساط'],
  shareholders: ['حساب سهامداران', 'حساب پرداخت شرکا'],
  'project-cost': ['حساب هزینه پروژه', 'حساب مخارج پروژه'],
  other: ['حساب بانکی جدید', 'حساب متفرقه'],
};

function createBankAccountDraft(id?: string): BankAccountRecord {
  return {
    id: id ?? globalThis.crypto?.randomUUID?.() ?? `bank-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    bankName: '',
    bankCode: '',
    bankLogoMode: 'badge',
    accountNumber: '',
    sheba: '',
    cardNumber: '',
    showInContracts: false,
    ownerName: '',
    owners: [],
    accountType: 'current',
    usage: 'primary',
    title: '',
  };
}

function normalizeCardParts(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, '').slice(0, 16);
  return [0, 1, 2, 3].map((index) => digits.slice(index * 4, index * 4 + 4));
}

function formatCardNumber(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, '').slice(0, 16);
  return digits ? digits.replace(/(.{4})/g, '$1 ').trim() : '';
}

function normalizeIban(value: string) {
  return value.replace(/\s+/g, '').toUpperCase();
}

function getIbanInputValue(value: string) {
  return normalizeIban(value).replace(/^IR/, '');
}

function isValidSheba(value: string) {
  if (!value.trim()) return true;
  return /^IR\d{24}$/.test(normalizeIban(value));
}

function isValidCardNumber(value: string) {
  if (!value.trim()) return true;
  return value.replace(/\D/g, '').length === 16;
}

function splitOwnerNames(value: string) {
  return value
    .split(/[،,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function BankAccountFormPanel({ accountId }: { accountId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('returnTo') ?? '';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<ProfileStore>(createDefaultProfileStore());
  const [meta, setMeta] = useState<ProfileMeta>(DEFAULT_PROFILE_META);
  const [account, setAccount] = useState<BankAccountRecord>(createBankAccountDraft());
  const [editingExisting, setEditingExisting] = useState(false);
  const [notice, setNotice] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState<BankAccountType | null>(null);
  const [selectedUsage, setSelectedUsage] = useState<BankAccountUsage | null>(null);
  const [selectedVisibility, setSelectedVisibility] = useState<ContractVisibility | null>(null);
  const [ownerDraft, setOwnerDraft] = useState('');
  const [cardParts, setCardParts] = useState(['', '', '', '']);

  useEffect(() => {
    let mounted = true;

    const hydrate = (sourceStore: ProfileStore, sourceMeta: ProfileMeta) => {
      setStore(sourceStore);
      setMeta(sourceMeta);
      const found = accountId ? sourceStore.bankAccounts.find((item) => item.id === accountId) : null;
      const nextAccount = found ?? createBankAccountDraft(accountId);
      setEditingExisting(Boolean(found));
      setAccount(nextAccount);
      setSelectedAccountType(found ? nextAccount.accountType : null);
      setSelectedUsage(found ? nextAccount.usage : null);
      setSelectedVisibility(found ? (nextAccount.showInContracts ? 'show' : 'hide') : null);
      setOwnerDraft(found ? nextAccount.ownerName || nextAccount.owners.join('، ') : '');
      setCardParts(normalizeCardParts(nextAccount.cardNumber));
    };

    const load = async () => {
      try {
        const payload = await fetchProfilePayload();
        if (!mounted) return;
        hydrate(payload.store, payload.meta);
      } catch (error) {
        if (!mounted) return;
        if (error instanceof Error && error.message === 'unauthorized') {
          router.replace(getSelectTenantPath(BUSINESS_PROFILE_BANK_ACCOUNTS));
          return;
        }
        hydrate(loadProfileStore(), DEFAULT_PROFILE_META);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [accountId, router]);

  const updateAccount = (patch: Partial<BankAccountRecord>) => {
    setAccount((current) => ({ ...current, ...patch }));
  };

  const updateVisibility = (value: ContractVisibility) => {
    setSelectedVisibility(value);
    updateAccount({ showInContracts: value === 'show' });
  };

  const updateCardPart = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setCardParts((current) => current.map((part, partIndex) => (partIndex === index ? digits : part)));
  };

  const applyTitleSuggestion = (suggestion: string) => {
    updateAccount({ title: suggestion });
  };

  const validateAndSave = async () => {
    const title = account.title.trim();
    const ownerNames = splitOwnerNames(ownerDraft);
    const ownerName = ownerNames[0] ?? '';
    const accountNumber = account.accountNumber.trim();
    const cardNumber = cardParts.filter(Boolean).join('');
    const sheba = normalizeIban(account.sheba.trim());

    if (!selectedAccountType) {
      setNotice('نوع حساب بانکی را انتخاب کنید.');
      return;
    }

    if (!selectedUsage) {
      setNotice('کاربرد حساب بانکی را مشخص کنید.');
      return;
    }

    if (!title) {
      setNotice('عنوان حساب را وارد کنید.');
      return;
    }

    if (selectedVisibility === null) {
      setNotice('نمایش در قراردادها را مشخص کنید.');
      return;
    }

    if (!ownerName) {
      setNotice('نام صاحب حساب را وارد کنید.');
      return;
    }

    if (!accountNumber) {
      setNotice('شماره حساب را وارد کنید.');
      return;
    }

    if (cardNumber && !isValidCardNumber(cardNumber)) {
      setNotice('شماره کارت واردشده معتبر نیست.');
      return;
    }

    if (!isValidSheba(sheba)) {
      setNotice('شماره شبا واردشده معتبر نیست.');
      return;
    }

    setSaving(true);
    setNotice('');

    try {
      const currentStore = await fetchProfileStore();
      const nextAccount: BankAccountRecord = {
        ...account,
        title,
        ownerName,
        owners: ownerNames,
        accountNumber,
        sheba,
        cardNumber,
        showInContracts: selectedVisibility === 'show',
        bankName: account.bankName || title || 'حساب بانکی',
        bankCode: account.bankCode || '',
        bankLogoMode: 'badge',
        accountType: selectedAccountType,
        usage: selectedUsage,
      };

      const nextStore = accountId && editingExisting ? updateBankAccount(currentStore, account.id, nextAccount) : addBankAccount(currentStore, nextAccount);
      await persistProfileStore(nextStore);

      router.push(returnTo || BUSINESS_PROFILE_BANK_ACCOUNTS);
      router.refresh();
    } catch (error) {
      if (error instanceof Error && error.message === 'unauthorized') {
        router.replace(getSelectTenantPath(BUSINESS_PROFILE_BANK_ACCOUNTS));
        return;
      }
      setNotice('حساب بانکی ذخیره نشد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingCard label="در حال بارگذاری فرم حساب بانکی..." />;
  }

  const titleSuggestionsToShow = selectedUsage ? titleSuggestions[selectedUsage] : titleSuggestions.primary;
  const businessName = store.ownership.companyName.trim() || store.ownership.brandName.trim() || meta.businessName.trim() || 'ثبت نشده';
  const ownerSuggestion = meta.owner.fullName.trim();

  return (
    <>
      {notice ? (
        <div className="profile-summary-card border-rose-500/20 bg-rose-500/10 text-rose-100" role="status" aria-live="polite">
          {notice}
        </div>
      ) : null}

      <ProfilePageShell className="bank-account-reference-page">
        {returnTo ? (
          <div className="bank-account-form-toolbar">
            <Link href={returnTo} className="bank-account-return-link">
              <ArrowRight className="h-4 w-4" />
              بازگشت به ثبت فیش
            </Link>
          </div>
        ) : null}

        <ProfileCard className="bank-account-form-card">
          <ProfileHeading
            title={accountId ? 'ویرایش حساب بانکی' : 'افزودن حساب بانکی'}
            description="حساب بانکی رسمی کسب‌وکار را برای استفاده در قراردادها، پرداخت‌ها و گزارش‌های مالی ثبت کنید."
          />

          <div className="grid gap-3 rounded-[18px] border border-amber-500/20 bg-amber-500/10 p-4 text-[13px] leading-7 text-amber-50">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
              <p className="m-0">
                این حساب برای پروفایل کسب‌وکار <strong className="text-amber-100">{businessName}</strong> ذخیره می‌شود و به کاربر مالک وابسته نیست.
              </p>
            </div>
          </div>

          <section className="bank-display-chip-section grid gap-4">
            <div className="grid gap-2">
              <h2 className="m-0 text-[16px] font-black text-[color:var(--text-strong)]">نوع و کاربرد حساب</h2>
              <p className="m-0 text-[12px] leading-6 text-[color:var(--text-muted)]">
                نوع حساب بانکی را از کاربرد آن جدا کنید تا در گزارش‌ها و قراردادها درست استفاده شود.
              </p>
            </div>

            <ProfileChipGroup
              label="نوع حساب بانکی"
              hint="نوع حساب بانکی را مشخص کنید؛ مثل جاری، کوتاه‌مدت یا قرض‌الحسنه."
              items={accountTypeOptions}
              value={selectedAccountType}
              onChange={(value) => {
                setSelectedAccountType(value);
                updateAccount({ accountType: value });
              }}
              className="bank-chip-section"
              pillsClassName="ownership-chip-row"
              pillClassName="ownership-chip-pill"
            />

            <ProfileChipGroup
              label="کاربرد حساب بانکی"
              hint="مشخص کنید این حساب برای چه هدفی در سیستم استفاده می‌شود."
              items={usageOptions}
              value={selectedUsage}
              onChange={(value) => {
                setSelectedUsage(value);
                updateAccount({ usage: value });
              }}
              className="bank-chip-section"
              pillsClassName="ownership-chip-row"
              pillClassName="ownership-chip-pill"
            />
          </section>

          <section className="bank-display-chip-section grid gap-4">
            <div className="grid gap-2">
              <h2 className="m-0 text-[16px] font-black text-[color:var(--text-strong)]">اطلاعات نمایشی در قراردادها</h2>
              <p className="m-0 text-[12px] leading-6 text-[color:var(--text-muted)]">
                این بخش مشخص می‌کند حساب در خروجی‌های رسمی و قراردادها با چه عنوانی دیده شود.
              </p>
            </div>

            <ProfileTextField
              label="عنوان حساب"
              hint="عنوانی قابل فهم برای تشخیص سریع این حساب در فهرست حساب‌ها وارد کنید."
              placeholder="مثلاً حساب قراردادهای پرسنلی شعبه مرکزی"
              value={account.title}
              required
              onChange={(value) => updateAccount({ title: value })}
            />

            <div className="grid gap-2">
              <span className="text-[13px] font-bold text-[color:var(--text-strong)]">پیشنهاد عنوان</span>
              <div className="bank-owner-tags">
                {titleSuggestionsToShow.map((suggestion) => (
                  <button key={suggestion} type="button" className="bank-owner-tag" onClick={() => applyTitleSuggestion(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <ProfileChipGroup
              label="نمایش در قراردادها"
              hint="اگر فعال باشد، این حساب می‌تواند در قراردادهای مرتبط نمایش داده شود."
              items={visibilityOptions}
              value={selectedVisibility}
              onChange={updateVisibility}
              className="bank-chip-section"
              pillsClassName="ownership-chip-row"
              pillClassName="ownership-chip-pill"
            />
          </section>

          <section className="bank-owner-block">
            <div className="grid gap-2">
              <h2 className="m-0 text-[16px] font-black text-[color:var(--text-strong)]">اطلاعات صاحب حساب</h2>
              <p className="m-0 text-[12px] leading-6 text-[color:var(--text-muted)]">
                نام صاحب حساب را مطابق اطلاعات بانکی وارد کنید.
              </p>
            </div>

            <ProfileTextField
              label="نام صاحب حساب"
              placeholder="نام صاحب حساب مطابق اطلاعات بانکی"
              value={ownerDraft}
              required
              onChange={setOwnerDraft}
              hint="در صورت نیاز می‌توانید نام مالک اکانت را به‌عنوان صاحب حساب وارد کنید. برای چند صاحب حساب، نام‌ها را با «،» جدا کنید."
            />

            <div className="grid gap-2">
              <span className="text-[13px] font-bold text-[color:var(--text-strong)]">پیشنهاد از مالک کسب‌وکار</span>
              {ownerSuggestion ? (
                <div className="bank-owner-tags">
                  <button type="button" className="bank-owner-tag" onClick={() => setOwnerDraft(ownerSuggestion)}>
                    {ownerSuggestion}
                  </button>
                </div>
              ) : (
                <small className="profile-field-hint text-[11px] leading-6 text-[color:var(--text-muted)]">
                  هنوز نام مالک کسب‌وکار ثبت نشده است.
                </small>
              )}
            </div>
          </section>

          <section className="bank-form-grid">
            <div className="grid gap-2 bank-full-width">
              <h2 className="m-0 text-[16px] font-black text-[color:var(--text-strong)]">شماره‌های بانکی</h2>
              <p className="m-0 text-[12px] leading-6 text-[color:var(--text-muted)]">
                شماره حساب، کارت و شبا را برای استفاده در پرداخت‌ها و اسناد رسمی ثبت کنید.
              </p>
            </div>

            <div className="bank-full-width">
              <ProfileTextField
                label="شماره حساب بانکی"
                value={account.accountNumber}
                required
                onChange={(value) => updateAccount({ accountNumber: value.slice(0, 20) })}
                hint="شماره حساب را وارد کنید."
              />
            </div>

            <div className="profile-form-field bank-full-width">
              <label>
                <span>شماره کارت</span>
              </label>
              <div className="bank-card-parts">
                <Building2 className="bank-card-icon" aria-hidden />
                {cardParts.map((part, index) => (
                  <input
                    key={index}
                    className="app-control bank-card-cell"
                    inputMode="numeric"
                    value={part}
                    placeholder="0000"
                    onChange={(event) => updateCardPart(index, event.target.value)}
                  />
                ))}
              </div>
              <small className="profile-field-hint text-[11px] leading-6 text-[color:var(--text-muted)]">
                شماره کارت اختیاری است، اما اگر ثبت شود باید معتبر باشد.
              </small>
            </div>

            <div className="profile-form-field">
              <label>
                <span>شماره شبا</span>
              </label>
              <div className="flex items-center gap-2 rounded-[16px] border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <span className="text-[12px] font-black tracking-[0.12em] text-cyan-300">IR</span>
                <input
                  className="app-control border-0 bg-transparent p-0 shadow-none outline-none"
                  dir="ltr"
                  inputMode="text"
                  value={getIbanInputValue(account.sheba)}
                  onChange={(event) => {
                    const next = normalizeIban(event.target.value).replace(/^IR/, '').slice(0, 24);
                    updateAccount({ sheba: next ? `IR${next}` : '' });
                  }}
                  placeholder="123456789012345678901234"
                />
              </div>
              <small className="profile-field-hint text-[11px] leading-6 text-[color:var(--text-muted)]">
                شماره شبا اختیاری است، اما اگر ثبت شود باید معتبر باشد.
              </small>
            </div>
          </section>
        </ProfileCard>

        <ProfileSubmitBar
          label={saving ? 'در حال ثبت...' : accountId ? 'ثبت ویرایش' : 'ثبت حساب بانکی'}
          onClick={() => void validateAndSave()}
          disabled={saving}
          align="center"
        />
      </ProfilePageShell>
    </>
  );
}
