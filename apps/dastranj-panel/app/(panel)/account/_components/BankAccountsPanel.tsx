'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { createDefaultProfileStore, DEFAULT_PROFILE_META, type BankAccountRecord, type ProfileMeta, type ProfileStore } from '../profile.types';
import { fetchProfilePayload, loadProfileStore, persistProfileStore, removeBankAccount } from '../profileStorage';
import {
  BUSINESS_PROFILE_BANK_ACCOUNTS,
  BUSINESS_PROFILE_ROOT,
  getBusinessProfileBankAccountEditPath,
  getBusinessProfileBankAccountNewPath,
  getSelectTenantPath,
} from '../routes';
import { Breadcrumbs, LoadingCard } from './account-ui';
import { PanelFormModal } from '../../../components/PanelFormModal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { CardMenu } from '../../../components/CardMenu';
import { ProfileReadonlyField } from './ProfileFormShell';

const accountTypeLabel: Record<string, string> = {
  current: 'جاری',
  short: 'کوتاه‌مدت',
  long: 'بلندمدت',
  loan: 'قرض‌الحسنه',
  foreign: 'ارزی',
};

const usageLabel: Record<string, string> = {
  primary: 'حساب اصلی',
  contract: 'حساب قرارداد',
  penalty: 'حساب جرائم',
  'late-fee': 'حساب صندوق',
  installment: 'حساب بانک',
  shareholders: 'حساب سهامداران',
  'project-cost': 'حساب هزینه پروژه',
  other: 'سایر',
};

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits ? digits.replace(/(.{4})/g, '$1 ').trim() : '';
}

function formatIban(value: string) {
  const normalized = value.replace(/\s+/g, '').toUpperCase();
  if (!normalized) return '';
  return normalized.replace(/(.{4})/g, '$1 ').trim();
}

function getOwnerName(account: BankAccountRecord) {
  return account.ownerName.trim() || account.owners.join('، ') || 'ثبت نشده';
}

function getVisibilityLabel(showInContracts: boolean) {
  return showInContracts ? 'نمایش در قراردادها' : 'عدم نمایش در قراردادها';
}

export default function BankAccountsPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<ProfileStore>(createDefaultProfileStore());
  const [meta, setMeta] = useState<ProfileMeta>(DEFAULT_PROFILE_META);
  const [notice, setNotice] = useState('');
  const [viewingAccount, setViewingAccount] = useState<BankAccountRecord | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<BankAccountRecord | null>(null);

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
          router.replace(getSelectTenantPath(BUSINESS_PROFILE_BANK_ACCOUNTS));
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

  const persistAccounts = async (nextAccounts: ProfileStore['bankAccounts']) => {
    setNotice('');
    const previousStore = store;
    const nextStore = { ...store, bankAccounts: nextAccounts };
    setStore(nextStore);

    try {
      const saved = await persistProfileStore(nextStore);
      setStore(saved);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message === 'unauthorized') {
        router.replace(getSelectTenantPath(BUSINESS_PROFILE_BANK_ACCOUNTS));
        return false;
      }
      setStore(previousStore);
      setNotice('حساب بانکی ذخیره نشد. دوباره تلاش کنید.');
      return false;
    }
  };

  const deleteAccount = async () => {
    if (!deletingAccount) return;
    const savedStore = removeBankAccount(store, deletingAccount.id);
    setDeletingAccount(null);
    const saved = await persistAccounts(savedStore.bankAccounts);
    if (!saved) return;
    setNotice('حساب بانکی با موفقیت حذف شد.');
  };

  const businessName = meta.businessName.trim() || store.ownership.companyName.trim() || store.ownership.brandName.trim() || 'ثبت نشده';

  if (loading) {
    return <LoadingCard label="در حال بارگذاری حساب‌های بانکی..." />;
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'خانه', href: BUSINESS_PROFILE_ROOT },
          { label: 'تنظیمات کسب‌وکار', href: '/business-settings' },
          { label: 'پروفایل کسب‌وکار', href: BUSINESS_PROFILE_ROOT },
          { label: 'حساب بانکی' },
        ]}
      />

      {notice ? (
        <div className="profile-summary-card border-emerald-500/20 bg-emerald-500/10 text-emerald-100" role="status" aria-live="polite">
          {notice}
        </div>
      ) : null}

      <section className="profile-workspace-page bank-accounts-reference-page" aria-label="لیست حساب های بانکی">
        <div className="profile-summary-card bank-accounts-toolbar">
          <div className="grid gap-1">
            <strong className="text-[15px] text-white">حساب‌های بانکی پروفایل کسب‌وکار</strong>
            <span className="text-[12px] leading-6 text-[color:var(--text-muted)]">این حساب‌ها برای قراردادها، پرداخت‌ها و گزارش‌های مالی همین tenant ذخیره می‌شوند.</span>
          </div>
          <Link href={getBusinessProfileBankAccountNewPath()} className="primary-button no-underline bank-accounts-add">
            <Plus className="h-4 w-4" />
            افزودن حساب بانکی جدید
          </Link>
        </div>

        {store.bankAccounts.length ? (
          <div className="bank-accounts-list">
            {store.bankAccounts.map((account) => (
              <article key={account.id} className="bank-account-card">
                <div className="bank-account-top">
                  <div className="bank-account-main">
                    <div className="bank-account-header">
                      <div className="bank-account-bank">
                        <Building2 className="h-4 w-4 text-cyan-300" aria-hidden />
                        <strong>{account.title || 'عنوان حساب ثبت نشده'}</strong>
                      </div>
                      <CardMenu
                        items={[
                          {
                            kind: 'action',
                            label: 'مشاهده',
                            icon: <Eye className="h-4 w-4" />,
                            onClick: () => setViewingAccount(account),
                          },
                          {
                            kind: 'link',
                            href: getBusinessProfileBankAccountEditPath(account.id),
                            label: 'ویرایش',
                            icon: <Pencil className="h-4 w-4" />,
                          },
                          {
                            kind: 'action',
                            label: 'حذف',
                            icon: <Trash2 className="h-4 w-4" />,
                            tone: 'danger',
                            onClick: () => setDeletingAccount(account),
                          },
                        ]}
                      />
                    </div>

                    <div className="bank-account-fields">
                      <div className="bank-account-field">
                        <span>عنوان حساب</span>
                        <strong>{account.title || 'ثبت نشده'}</strong>
                      </div>
                      <div className="bank-account-field">
                        <span>نوع حساب بانکی</span>
                        <strong>{accountTypeLabel[account.accountType] || 'ثبت نشده'}</strong>
                      </div>
                      <div className="bank-account-field">
                        <span>کاربرد حساب بانکی</span>
                        <strong>{usageLabel[account.usage] || 'ثبت نشده'}</strong>
                      </div>
                      <div className="bank-account-field">
                        <span>نام صاحب حساب</span>
                        <strong>{getOwnerName(account)}</strong>
                      </div>
                      <div className="bank-account-field">
                        <span>شماره حساب بانکی</span>
                        <strong dir="ltr">{account.accountNumber || 'ثبت نشده'}</strong>
                      </div>
                      <div className="bank-account-field">
                        <span>شماره کارت</span>
                        <strong dir="ltr">{formatCardNumber(account.cardNumber) || 'ثبت نشده'}</strong>
                      </div>
                      <div className="bank-account-field">
                        <span>شماره شبا</span>
                        <strong dir="ltr">{formatIban(account.sheba) || 'ثبت نشده'}</strong>
                      </div>
                      <div className="bank-account-field">
                        <span>نمایش در قراردادها</span>
                        <strong>{getVisibilityLabel(account.showInContracts)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bank-account-empty-state">
            <p>هنوز هیچ حساب بانکی ثبت نشده است.</p>
            <span>برای استفاده در قراردادها، گزارش‌ها یا پرداخت‌ها، یک حساب بانکی جدید اضافه کنید.</span>
            <Link href={getBusinessProfileBankAccountNewPath()} className="primary-button no-underline bank-accounts-add">
              افزودن حساب بانکی جدید
            </Link>
          </div>
        )}
      </section>

      <PanelFormModal
        open={Boolean(viewingAccount)}
        title={viewingAccount?.title || 'جزئیات حساب بانکی'}
        lead={`متعلق به پروفایل کسب‌وکار ${businessName}`}
        onClose={() => setViewingAccount(null)}
        footer={
          <div className="flex flex-wrap gap-2">
            {viewingAccount ? (
              <Link href={getBusinessProfileBankAccountEditPath(viewingAccount.id)} className="secondary-button no-underline">
                ویرایش
              </Link>
            ) : null}
            <button type="button" className="primary-button" onClick={() => setViewingAccount(null)}>
              بستن
            </button>
          </div>
        }
      >
        {viewingAccount ? (
          <div className="grid gap-4 text-[13px] leading-7 text-slate-200">
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`status-chip ${viewingAccount.showInContracts ? 'status-chip-completed' : 'status-chip-pending'}`}>
                  {getVisibilityLabel(viewingAccount.showInContracts)}
                </span>
                <span className="status-chip status-chip-completed">{accountTypeLabel[viewingAccount.accountType] || 'ثبت نشده'}</span>
                <span className="status-chip status-chip-completed">{usageLabel[viewingAccount.usage] || 'ثبت نشده'}</span>
              </div>
              <p className="m-0 mt-3 text-[12px] leading-6 text-slate-300">این حساب برای استفاده در جریان رسمی کسب‌وکار ثبت شده و به مالک کاربری وابسته نیست.</p>
            </div>

            <div className="grid gap-3">
              <ProfileReadonlyField label="عنوان حساب" value={viewingAccount.title || 'ثبت نشده'} />
              <ProfileReadonlyField label="نام صاحب حساب" value={getOwnerName(viewingAccount)} />
              <ProfileReadonlyField label="شماره حساب بانکی" value={viewingAccount.accountNumber || 'ثبت نشده'} />
              <ProfileReadonlyField label="شماره کارت" value={formatCardNumber(viewingAccount.cardNumber) || 'ثبت نشده'} />
              <ProfileReadonlyField label="شماره شبا" value={formatIban(viewingAccount.sheba) || 'ثبت نشده'} />
            </div>
          </div>
        ) : null}
      </PanelFormModal>

      <ConfirmDialog
        open={Boolean(deletingAccount)}
        title="حذف حساب بانکی"
        description={`آیا از حذف حساب «${deletingAccount?.title || 'بدون عنوان'}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.`}
        confirmLabel="حذف"
        cancelLabel="انصراف"
        tone="danger"
        onConfirm={() => void deleteAccount()}
        onCancel={() => setDeletingAccount(null)}
      />
    </>
  );
}
