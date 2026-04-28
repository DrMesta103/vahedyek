'use client';

import { Building2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  addBankAccount,
  loadProfileStore,
  saveProfileStore,
  updateBankAccount,
  type BankAccountRecord,
  type BankAccountType,
  type BankAccountUsage,
} from './profileStorage';
import {
  ProfileCard,
  ProfileChipGroup,
  ProfileHeading,
  ProfilePageShell,
  ProfileSubmitBar,
  ProfileTextField,
} from './ProfileFormShell';
import { TagPill } from '../../../contracts/new/_components/ContractFormPrimitives';

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

const titleOptions = ['وجه التزام', 'دیرکرد', 'تعدیل', 'خسارتهای قراردادی', 'حساب دریافت جرایم'].map((item) => ({
  value: item,
  label: item,
}));

export function BusinessBankAccountFormPanel({ accountId }: { accountId?: string }) {
  const router = useRouter();
  const [accountType, setAccountType] = useState<BankAccountType | null>(null);
  const [usage, setUsage] = useState<BankAccountUsage | null>(null);
  const [title, setTitle] = useState('');
  const [showInContracts, setShowInContracts] = useState(false);
  const [owners, setOwners] = useState<string[]>([]);
  const [ownerDraft, setOwnerDraft] = useState('');
  const [cardParts, setCardParts] = useState(['', '', '', '']);
  const [sheba, setSheba] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  useEffect(() => {
    if (!accountId) return;
    const account = loadProfileStore().bankAccounts.find((item) => item.id === accountId);
    if (!account) return;
    setAccountType(account.accountType);
    setUsage(account.usage);
    setTitle(account.title);
    setShowInContracts(account.showInContracts);
    setOwners(account.owners);
    setCardParts(account.cardNumber.split(' ').concat(['', '', '', '']).slice(0, 4));
    setSheba(account.sheba);
    setAccountNumber(account.accountNumber);
  }, [accountId]);

  const submit = () => {
    if (!accountType || !usage) return;

    const bankAccount: BankAccountRecord = {
      id: accountId ?? `bank-${Date.now()}`,
      bankName: 'بانک جدید',
      bankCode: 'ج',
      bankLogoMode: 'badge',
      accountNumber,
      sheba,
      cardNumber: cardParts.join(' '),
      showInContracts,
      owners,
      accountType,
      usage,
      title: title || 'سایر',
    };

    const store = loadProfileStore();
    saveProfileStore(accountId ? updateBankAccount(store, accountId, bankAccount) : addBankAccount(store, bankAccount));
    router.push('/business-settings/profile/bank-accounts');
    router.refresh();
  };

  return (
    <ProfilePageShell>
      <ProfileCard>
        <ProfileHeading title={accountId ? 'ویرایش حساب بانکی' : 'افزودن حساب بانکی'} description="حساب بانکی مورد استفاده در قراردادها و گزارش‌ها را ثبت کنید." />

        <ProfileChipGroup
          label="نوع حساب بانکی"
          hint="در این بخش نوع حساب بانکی خود را مشخص کنید."
          items={accountTypeOptions}
          value={accountType}
          onChange={(value) => {
            setAccountType(value);
            setUsage(null);
            setTitle('');
          }}
        />

        {accountType ? (
          <ProfileChipGroup
            label="نوع کاربری حساب بانکی"
            hint="در این بخش نوع کاربری حساب بانکی را مشخص کنید."
            items={usageOptions}
            value={usage}
            onChange={(value) => setUsage(value)}
          />
        ) : null}

        {usage ? (
          <>
            <ProfileChipGroup label="عنوان" items={titleOptions} value={title || null} onChange={setTitle} />

            <ProfileChipGroup
              label="نمایش در قرارداد"
              items={[
                { value: 'hide', label: 'عدم نمایش قرارداد' },
                { value: 'show', label: 'نمایش در قرارداد' },
              ]}
              value={showInContracts ? 'show' : 'hide'}
              onChange={(value) => setShowInContracts(value === 'show')}
            />

            <div className="bank-owner-block minimal">
              <div className="bank-owner-head">
                <strong>نام صاحب / صاحبان حساب</strong>
                <button
                  type="button"
                  onClick={() => {
                    const next = ownerDraft.trim();
                    if (!next) return;
                    setOwners((current) => [...current, next]);
                    setOwnerDraft('');
                  }}
                >
                  <Plus />
                </button>
              </div>
              <ProfileTextField label="صاحب حساب" value={ownerDraft} onChange={setOwnerDraft} />
              <div className="bank-owner-tags">
                {owners.length
                  ? owners.map((owner) => <TagPill key={owner} label={owner} active onClick={() => undefined} className="pointer-events-none" />)
                  : <small>صاحب حسابی ثبت نشده است</small>}
              </div>
            </div>

            <div className="bank-form-grid">
              <div className="profile-form-field">
                <label>شماره کارت</label>
                <div className="bank-card-parts">
                  <Building2 />
                  {cardParts.map((part, index) => (
                    <ProfileTextInputCell
                      key={index}
                      value={part}
                      onChange={(value) => {
                        const next = [...cardParts];
                        next[index] = value.slice(0, 4);
                        setCardParts(next);
                      }}
                    />
                  ))}
                </div>
              </div>

              <ProfileTextField label="شماره شبا" value={sheba} onChange={(value) => setSheba(value.slice(0, 26))} />

              <div className="bank-full-width">
                <ProfileTextField label="شماره حساب" value={accountNumber} onChange={(value) => setAccountNumber(value.slice(0, 20))} />
              </div>
            </div>
          </>
        ) : null}
      </ProfileCard>

      <ProfileSubmitBar label="ثبت" onClick={submit} disabled={!accountType || !usage} />
    </ProfilePageShell>
  );
}

function ProfileTextInputCell({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input className="app-control bank-card-cell" value={value} onChange={(event) => onChange(event.target.value)} />
  );
}
