'use client';

import Link from 'next/link';
import { ArrowRight, Building2, Plus } from 'lucide-react';
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
import { BUSINESS_PROFILE_BANK_ACCOUNTS, BUSINESS_PROFILE_ROOT, getSelectTenantPath } from '../routes';
import { Breadcrumbs, LoadingCard } from './account-ui';
import { ProfileBackLink, ProfileCard, ProfileChipGroup, ProfileHeading, ProfilePageShell, ProfileSubmitBar, ProfileTextField } from './ProfileFormShell';

const accountTypeOptions: Array<{ value: BankAccountType; label: string }> = [
  { value: 'current', label: 'جاری' },
  { value: 'short', label: 'کوتاه مدت' },
  { value: 'long', label: 'بلند مدت' },
  { value: 'loan', label: 'قرض الحسنه' },
  { value: 'foreign', label: 'ارزی' },
];

const usageOptions: Array<{ value: BankAccountUsage; label: string }> = [
  { value: 'primary', label: 'حساب اصلی' },
  { value: 'contract', label: 'حساب قرارداد' },
  { value: 'penalty', label: 'حساب جرایم' },
  { value: 'late-fee', label: 'حساب سود متفرقه' },
  { value: 'installment', label: 'حساب اقساط بانکی' },
  { value: 'shareholders', label: 'حساب سهامداران' },
  { value: 'project-cost', label: 'حساب هزینه پروژه' },
  { value: 'other', label: 'سایر' },
];

const titleOptions = ['وجه التزام', 'دیرکرد', 'تعدیل', 'خسارت‌های قراردادی', 'حساب دریافت جرایم'].map((item) => ({
  value: item,
  label: item,
}));

function createBankAccountDraft(id?: string): BankAccountRecord {
  return {
    id: id ?? globalThis.crypto?.randomUUID?.() ?? `bank-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    bankName: 'بانک جدید',
    bankCode: 'ج',
    bankLogoMode: 'badge',
    accountNumber: '',
    sheba: '',
    cardNumber: '',
    showInContracts: false,
    owners: [],
    accountType: 'current',
    usage: 'primary',
    title: '',
  };
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
  const [ownerDraft, setOwnerDraft] = useState('');
  const [cardParts, setCardParts] = useState(['', '', '', '']);
  const [selectedAccountType, setSelectedAccountType] = useState<BankAccountType | null>(null);
  const [selectedUsage, setSelectedUsage] = useState<BankAccountUsage | null>(null);

  useEffect(() => {
    let mounted = true;

    const hydrate = (sourceStore: ProfileStore, sourceMeta: ProfileMeta) => {
      setStore(sourceStore);
      setMeta(sourceMeta);
      const found = accountId ? sourceStore.bankAccounts.find((item) => item.id === accountId) : null;
      setEditingExisting(Boolean(found));
      const nextAccount = found ?? createBankAccountDraft(accountId);
      setAccount(nextAccount);
      setSelectedAccountType(found ? nextAccount.accountType : null);
      setSelectedUsage(found ? nextAccount.usage : null);
      const nextCardParts = nextAccount.cardNumber
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean)
        .concat(['', '', '', ''])
        .slice(0, 4);
      setCardParts(nextCardParts);
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

  const setAccountType = (value: BankAccountType) => {
    setSelectedAccountType(value);
    setSelectedUsage(null);
    setAccount((current) => ({
      ...current,
      accountType: value,
      usage: 'primary',
      title: '',
      showInContracts: false,
    }));
  };

  const setUsage = (value: BankAccountUsage) => {
    setSelectedUsage(value);
    updateAccount({ usage: value });
  };

  const setTitle = (value: string) => {
    updateAccount({ title: value });
  };

  const addOwner = () => {
    const nextOwner = ownerDraft.trim();
    if (!nextOwner) return;
    setAccount((current) => ({
      ...current,
      owners: current.owners.includes(nextOwner) ? current.owners : [...current.owners, nextOwner],
    }));
    setOwnerDraft('');
  };

  const removeOwner = (owner: string) => {
    setAccount((current) => ({
      ...current,
      owners: current.owners.filter((item) => item !== owner),
    }));
  };

  const updateCardPart = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setCardParts((current) => current.map((part, partIndex) => (partIndex === index ? digits : part)));
  };

  const save = async () => {
    setSaving(true);
    setNotice('');

    try {
      const currentStore = await fetchProfileStore();
      const nextAccount: BankAccountRecord = {
        ...account,
        bankName: account.bankName || account.title || 'بانک جدید',
        bankCode: account.bankCode || 'ج',
        bankLogoMode: 'badge',
        cardNumber: cardParts.filter(Boolean).join(' '),
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
      setNotice('ثبت حساب بانکی با خطا مواجه شد.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingCard label="در حال بارگذاری فرم حساب بانکی..." />;
  }

  const usageSelected = Boolean(selectedUsage);
  const titleSelected = Boolean(account.title);
  const showUsageFlow = Boolean(selectedAccountType);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'خانه', href: BUSINESS_PROFILE_ROOT },
          { label: 'تنظیمات کسب و کار', href: '/business-settings' },
          { label: 'پروفایل کسب‌وکار', href: BUSINESS_PROFILE_ROOT },
          { label: 'شماره حساب', href: BUSINESS_PROFILE_BANK_ACCOUNTS },
          { label: accountId ? 'ویرایش' : 'افزودن' },
        ]}
      />

      {notice ? <LoadingCard label={notice} /> : null}

      <ProfilePageShell className="bank-account-reference-page">
        <div className="bank-account-form-toolbar">
          <ProfileBackLink href={returnTo || BUSINESS_PROFILE_BANK_ACCOUNTS}>بازگشت به فهرست حساب‌ها</ProfileBackLink>
          {returnTo ? (
            <Link href={returnTo} className="bank-account-return-link">
              <ArrowRight className="h-4 w-4" />
              بازگشت به ثبت فیش
            </Link>
          ) : null}
        </div>

        <ProfileCard className="bank-account-form-card">
          <ProfileHeading
            title={accountId ? 'ویرایش حساب بانکی' : 'افزودن حساب بانکی'}
            description="حساب بانکی مورد استفاده در قراردادها و گزارش‌ها را ثبت کنید."
          />

          <ProfileChipGroup
            label="نوع حساب بانکی"
            hint="در این بخش نوع حساب بانکی خود را مشخص کنید."
            items={accountTypeOptions}
            value={selectedAccountType}
            onChange={setAccountType}
            className="bank-chip-section"
            pillsClassName="ownership-chip-row"
            pillClassName="ownership-chip-pill"
          />

          {showUsageFlow ? (
            <ProfileChipGroup
              label="نوع کاربری حساب بانکی"
              hint="در این بخش نوع کاربری حساب بانکی را مشخص کنید."
              items={usageOptions}
              value={selectedUsage}
              onChange={setUsage}
              className="bank-chip-section"
              pillsClassName="ownership-chip-row"
              pillClassName="ownership-chip-pill"
            />
          ) : null}

          {usageSelected ? (
            <>
              <ProfileChipGroup
                label="عنوان"
                items={titleOptions}
                value={titleSelected ? account.title : null}
                onChange={setTitle}
                className="bank-chip-section"
                pillsClassName="ownership-chip-row"
                pillClassName="ownership-chip-pill"
              />

              <ProfileChipGroup
                label="نمایش در قرارداد"
                items={[
                  { value: 'hide', label: 'عدم نمایش قرارداد' },
                  { value: 'show', label: 'نمایش در قرارداد' },
                ]}
                value={account.showInContracts ? 'show' : 'hide'}
                onChange={(value) => updateAccount({ showInContracts: value === 'show' })}
                className="bank-chip-section bank-display-chip-section"
                pillsClassName="ownership-chip-row"
                pillClassName="ownership-chip-pill"
              />

              <div className="bank-owner-block minimal">
                <div className="bank-owner-head">
                  <strong>نام صاحب / صاحبان حساب</strong>
                  <button type="button" onClick={addOwner} aria-label="افزودن صاحب حساب">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <ProfileTextField label="صاحب حساب" value={ownerDraft} onChange={setOwnerDraft} />

                <div className="bank-owner-tags">
                  {account.owners.length ? (
                    account.owners.map((owner) => (
                      <button key={owner} type="button" className="bank-owner-tag" onClick={() => removeOwner(owner)}>
                        {owner}
                      </button>
                    ))
                  ) : (
                    <small>صاحب حسابی ثبت نشده است</small>
                  )}
                </div>
              </div>

              <div className="bank-form-grid">
                <div className="profile-form-field">
                  <label>شماره کارت</label>
                  <div className="bank-card-parts">
                    <Building2 className="bank-card-icon" />
                    {cardParts.map((part, index) => (
                      <input
                        key={index}
                        className="app-control bank-card-cell"
                        inputMode="numeric"
                        value={part}
                        onChange={(event) => updateCardPart(index, event.target.value)}
                      />
                    ))}
                  </div>
                </div>

                <ProfileTextField label="شماره شبا" value={account.sheba} onChange={(value) => updateAccount({ sheba: value.slice(0, 26) })} />

                <div className="bank-full-width">
                  <ProfileTextField label="شماره حساب" value={account.accountNumber} onChange={(value) => updateAccount({ accountNumber: value.slice(0, 20) })} />
                </div>
              </div>
            </>
          ) : null}
        </ProfileCard>

        <ProfileSubmitBar
          label={saving ? 'در حال ثبت...' : accountId ? 'ثبت ویرایش' : 'ثبت'}
          onClick={save}
          disabled={saving || !selectedAccountType || !selectedUsage}
          align="center"
        />

        <div className="bank-account-form-meta">
          <strong>مالک tenant</strong>
          <span>{meta.owner.fullName || 'ثبت نشده'}</span>
        </div>
      </ProfilePageShell>
    </>
  );
}
