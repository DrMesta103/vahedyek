'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
import { CardMenu } from '../../../components/CardMenu';

export default function BankAccountsPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<ProfileStore>(createDefaultProfileStore());
  const [meta, setMeta] = useState<ProfileMeta>(DEFAULT_PROFILE_META);
  const [notice, setNotice] = useState('');

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

  const persistAccounts = async (nextAccounts: BankAccountRecord[]) => {
    setNotice('');
    const nextStore = { ...store, bankAccounts: nextAccounts };
    setStore(nextStore);

    try {
      const saved = await persistProfileStore(nextStore);
      setStore(saved);
    } catch (error) {
      if (error instanceof Error && error.message === 'unauthorized') {
        router.replace(getSelectTenantPath(BUSINESS_PROFILE_BANK_ACCOUNTS));
        return;
      }
      setNotice('ثبت حساب بانکی با خطا مواجه شد.');
    }
  };

  const toggleVisibility = async (accountId: string) => {
    const nextAccounts = store.bankAccounts.map((item) => (item.id === accountId ? { ...item, showInContracts: !item.showInContracts } : item));
    await persistAccounts(nextAccounts);
  };

  const deleteAccount = async (accountId: string) => {
    const savedStore = removeBankAccount(store, accountId);
    await persistAccounts(savedStore.bankAccounts);
  };

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
          { label: 'شماره حساب' },
        ]}
      />

      {notice ? <LoadingCard label={notice} /> : null}

      <section className="profile-workspace-page bank-accounts-reference-page" aria-label="لیست حساب های بانکی">
        <div className="bank-accounts-toolbar">
          <Link href={getBusinessProfileBankAccountNewPath()} className="primary-button no-underline bank-accounts-add">
            <Plus className="h-4 w-4" />
            افزودن حساب بانکی جدید
          </Link>
        </div>

        <div className="bank-accounts-list">
          {store.bankAccounts.length ? (
            store.bankAccounts.map((account) => (
              <article key={account.id} className="bank-account-card">
                <div className="bank-account-top">
                  <div className="bank-account-main">
                    <div className="bank-account-header">
                      <div className="bank-account-bank">
                        <strong>{account.bankName || account.title || 'بانک جدید'}</strong>
                      </div>
                      <CardMenu
                        items={[
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
                            onClick: () => void deleteAccount(account.id),
                          },
                        ]}
                      />
                    </div>

                    <div className="bank-account-fields">
                      <div className="bank-account-field">
                        <span>شماره حساب</span>
                        <strong dir="ltr">{account.accountNumber || '---'}</strong>
                      </div>
                      <div className="bank-account-field">
                        <span>شماره کارت</span>
                        <strong dir="ltr">{account.cardNumber || '---'}</strong>
                      </div>
                      <div className="bank-account-field">
                        <span>شماره شبا</span>
                        <strong dir="ltr">{account.sheba || '---'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bank-account-bottom">
                  <div className="bank-account-switch-row">
                    <div>
                      <strong>نمایش در قرارداد</strong>
                    </div>
                    <button
                      type="button"
                      className={`bank-account-toggle${account.showInContracts ? ' is-on' : ''}`}
                      onClick={() => void toggleVisibility(account.id)}
                      aria-pressed={account.showInContracts}
                    >
                      <span />
                    </button>
                  </div>

                  {account.owners.length > 0 && (
                    <div className="bank-account-owners">
                      <strong>صاحبان حساب</strong>
                      {account.owners.map((owner, index) => <span key={`${account.id}-${owner}`}>{index + 1}. {owner}</span>)}
                    </div>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="bank-account-empty-state">
              <p>هنوز هیچ حساب بانکی ثبت نشده است. از دکمه «افزودن حساب بانکی جدید» استفاده کنید.</p>
              <span>{meta.owner.fullName || 'مالک کسب‌وکار ثبت نشده است.'}</span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function BankBadge({ account }: { account: BankAccountRecord }) {
  if (account.bankLogoMode === 'badge') {
    return <div className="bank-logo-badge">{account.bankCode || 'ج'}</div>;
  }

  return (
    <div className="bank-logo-text">
      <span>{account.bankName || 'بانک'}</span>
    </div>
  );
}
