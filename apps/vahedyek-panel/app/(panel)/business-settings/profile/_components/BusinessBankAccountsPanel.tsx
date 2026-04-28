'use client';

import Link from 'next/link';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  loadProfileStore,
  removeBankAccount,
  saveProfileStore,
  type BankAccountRecord,
} from './profileStorage';

export function BusinessBankAccountsPanel() {
  const [accounts, setAccounts] = useState<BankAccountRecord[]>([]);

  useEffect(() => {
    setAccounts(loadProfileStore().bankAccounts);
  }, []);

  const toggleVisibility = (accountId: string) => {
    setAccounts((current) => {
      const next = current.map((item) =>
        item.id === accountId ? { ...item, showInContracts: !item.showInContracts } : item
      );
      const store = loadProfileStore();
      saveProfileStore({ ...store, bankAccounts: next });
      return next;
    });
  };

  const deleteAccount = (accountId: string) => {
    setAccounts((current) => {
      const store = loadProfileStore();
      const nextStore = removeBankAccount(store, accountId);
      saveProfileStore(nextStore);
      return current.filter((item) => item.id !== accountId);
    });
  };

  return (
    <section className="profile-workspace-page" aria-label="لیست حساب های بانکی">
      <div className="bank-accounts-toolbar">
        <Link href="/business-settings/profile/bank-accounts/new" className="representative-add-button bank-accounts-add">
          افزودن حساب بانکی جدید
        </Link>
      </div>

      <div className="bank-accounts-list">
        {accounts.map((account) => (
          <article key={account.id} className="bank-account-card">
            <div className="bank-account-top">
              <button type="button" className="bank-account-more" aria-label="گزینه ها">
                <MoreVertical />
              </button>

              <div className="bank-account-main">
                <div className="bank-account-header">
                  <div className="bank-account-bank">
                    <strong>{account.bankName}</strong>
                    <div className="bank-account-actions">
                      <Link href={`/business-settings/profile/bank-accounts/${account.id}/edit`}>
                        <Pencil />
                        ویرایش
                      </Link>
                      <button type="button" onClick={() => deleteAccount(account.id)}>
                        <Trash2 />
                        حذف
                      </button>
                    </div>
                  </div>
                  <BankBadge account={account} />
                </div>

                <div className="bank-account-number" dir="ltr">
                  {account.accountNumber}
                </div>

                <div className="bank-account-meta">
                  <div>
                    <span>شماره حساب</span>
                    <strong dir="ltr">{account.cardNumber}</strong>
                  </div>
                  <div>
                    <span>شماره شبا</span>
                    <strong dir="ltr">{account.sheba}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="bank-account-bottom">
              <div className="bank-account-switch-row">
                <button
                  type="button"
                  className={`bank-account-toggle${account.showInContracts ? ' is-on' : ''}`}
                  onClick={() => toggleVisibility(account.id)}
                  aria-pressed={account.showInContracts}
                >
                  <span />
                </button>
                <div>
                  <strong>امکان نمایش در قرارداد</strong>
                  <p>در صورت تایید میتوانید از اطلاعات این حساب بانکی در متن قرارداد استفاده کنید.</p>
                </div>
              </div>

              <div className="bank-account-owners">
                <strong>نام صاحب / صاحبان حساب</strong>
                {account.owners.map((owner, index) => (
                  <span key={`${account.id}-${owner}`}>{index + 1} - {owner}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function BankBadge({ account }: { account: BankAccountRecord }) {
  if (account.bankLogoMode === 'badge') {
    return <div className="bank-logo-badge">{account.bankCode}</div>;
  }

  return (
    <div className="bank-logo-text">
      <span>{account.bankName}</span>
    </div>
  );
}
