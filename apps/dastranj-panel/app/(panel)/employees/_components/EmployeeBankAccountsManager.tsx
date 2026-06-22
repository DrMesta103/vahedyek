'use client';

import { useMemo, useState, useTransition } from 'react';
import { Building2, Layers, Pencil, Search, Trash2 } from 'lucide-react';
import { ModulePageHeader } from '../../../components/module-page/ModulePageHeader';
import { saveEmployeeBankAccountsAction } from '../../../lib/actions';
import {
  type EmployeeBankAccount,
  formatCardNumber,
  parseBankAccounts,
} from '../../../lib/employee-records';
import { formatPersianDate } from '../../../lib/format-date';
import { EmployeeModal } from './EmployeeModal';

type EmployeeBankAccountsManagerProps = {
  employeeId: string;
  employeeName: string;
  initialAccounts: EmployeeBankAccount[];
};

function splitCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return [0, 1, 2, 3].map((index) => digits.slice(index * 4, index * 4 + 4));
}

function joinCardSegments(segments: string[]) {
  return segments.join('');
}

function createAccountId() {
  return `ba_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function EmployeeBankAccountsManager({ employeeId, employeeName, initialAccounts }: EmployeeBankAccountsManagerProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [bankName, setBankName] = useState('');
  const [cardSegments, setCardSegments] = useState(['', '', '', '']);
  const [sheba, setSheba] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const resetForm = () => {
    setBankName('');
    setCardSegments(['', '', '', '']);
    setSheba('');
    setAccountNumber('');
    setIsPrimary(false);
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (account: EmployeeBankAccount) => {
    setEditingId(account.id);
    setBankName(account.bankName);
    setCardSegments(splitCardNumber(account.cardNumber));
    setSheba(account.sheba ?? '');
    setAccountNumber(account.accountNumber ?? '');
    setIsPrimary(account.isPrimary);
    setModalOpen(true);
  };

  const persist = (nextAccounts: EmployeeBankAccount[]) => {
    setAccounts(nextAccounts);
    const formData = new FormData();
    formData.set('employeeId', employeeId);
    formData.set('accounts', JSON.stringify(nextAccounts));
    startTransition(() => {
      void saveEmployeeBankAccountsAction(formData);
    });
  };

  const handleSubmit = () => {
    if (!bankName.trim() || joinCardSegments(cardSegments).length < 16) return;

    const payload: EmployeeBankAccount = {
      id: editingId ?? createAccountId(),
      bankName: bankName.trim(),
      cardNumber: joinCardSegments(cardSegments),
      sheba: sheba.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      isPrimary,
      createdAt: editingId ? accounts.find((item) => item.id === editingId)?.createdAt ?? new Date().toISOString() : new Date().toISOString(),
    };

    let next = editingId ? accounts.map((item) => (item.id === editingId ? payload : item)) : [...accounts, payload];
    if (isPrimary) {
      next = next.map((item) => ({ ...item, isPrimary: item.id === payload.id }));
    }
    persist(next);
    setModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    persist(accounts.filter((item) => item.id !== id));
  };

  const setPrimary = (id: string) => {
    persist(accounts.map((item) => ({ ...item, isPrimary: item.id === id })));
  };

  const cardValid = useMemo(() => joinCardSegments(cardSegments).length === 16, [cardSegments]);

  return (
    <div className="employee-sub-page">
      <ModulePageHeader
        title="حساب‌های بانکی کارمند"
        subtitle="مدیریت حساب‌های بانکی ثبت‌شده برای هر کارمند"
        titleHref={`/employees/${employeeId}`}
      />

      <div className="employee-sub-toolbar">
        <button type="button" className="employee-sub-search-btn" aria-label="جستجو">
          <Search className="h-5 w-5" />
        </button>
        <button type="button" className="module-page-add-btn" onClick={openCreate}>
          <span aria-hidden>+</span>
          افزودن حساب بانکی
        </button>
      </div>

      <div className="employee-sub-grid">
        {accounts.map((account) => (
          <article key={account.id} className="employee-bank-card">
            <div className="employee-bank-card-top">
              <div className="employee-bank-card-actions">
                <button type="button" className="request-reason-icon-btn" aria-label="ویرایش" onClick={() => openEdit(account)}>
                  <Pencil className="h-4 w-4" strokeWidth={2.2} />
                </button>
                <button type="button" className="request-reason-icon-btn is-danger" aria-label="حذف" onClick={() => handleDelete(account.id)}>
                  <Trash2 className="h-4 w-4" strokeWidth={2.2} />
                </button>
              </div>
              {!account.isPrimary ? (
                <button type="button" className="employee-bank-primary-btn" onClick={() => setPrimary(account.id)}>
                  تنظیم به عنوان حساب اصلی
                </button>
              ) : (
                <span className="employee-bank-primary-badge">حساب اصلی</span>
              )}
              <div className="employee-bank-card-bank">
                <Building2 className="h-5 w-5" />
                <strong>{account.bankName}</strong>
              </div>
            </div>
            <div className="employee-bank-card-body">
              <div className="employee-detail-row">
                <span className="employee-detail-label">شماره کارت:</span>
                <span className="employee-detail-value">{formatCardNumber(account.cardNumber)}</span>
              </div>
              <div className="employee-detail-row">
                <span className="employee-detail-label">شبا:</span>
                <span className="employee-detail-value">{account.sheba ?? '-'}</span>
              </div>
              <div className="employee-detail-row">
                <span className="employee-detail-label">شماره حساب:</span>
                <span className="employee-detail-value">{account.accountNumber ?? '-'}</span>
              </div>
              <div className="employee-detail-row">
                <span className="employee-detail-label">تاریخ ایجاد:</span>
                <span className="employee-detail-value">{formatPersianDate(account.createdAt)}</span>
              </div>
            </div>
          </article>
        ))}

        <button type="button" className="module-add-tile employee-sub-add-tile" onClick={openCreate}>
          <span className="module-add-tile-icon">
            <Layers className="h-7 w-7" strokeWidth={2.2} />
          </span>
          <span className="module-add-tile-text">برای افزودن حساب بانکی کلیک کنید.</span>
        </button>
      </div>

      <EmployeeModal
        open={modalOpen}
        title={editingId ? 'ویرایش حساب بانکی' : 'افزودن حساب بانکی جدید'}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
      >
        <div className="employee-modal-form">
          <label className="employee-add-field employee-add-field-full">
            <span className="employee-add-field-label">
              نام بانک <span className="employee-add-required">*</span>
            </span>
            <input value={bankName} onChange={(event) => setBankName(event.target.value)} />
          </label>

          <label className="employee-add-field employee-add-field-full">
            <span className="employee-add-field-label">
              شماره کارت <span className="employee-add-required">*</span>
            </span>
            <div className="employee-card-segments">
              <Building2 className="h-5 w-5 opacity-60" aria-hidden />
              {cardSegments.map((segment, index) => (
                <input
                  key={index}
                  value={segment}
                  maxLength={4}
                  inputMode="numeric"
                  onChange={(event) => {
                    const next = [...cardSegments];
                    next[index] = event.target.value.replace(/\D/g, '').slice(0, 4);
                    setCardSegments(next);
                  }}
                />
              ))}
            </div>
          </label>

          <label className="employee-add-field employee-add-field-full">
            <span className="employee-add-field-label">شبا</span>
            <div className="employee-modal-input-icon">
              <Building2 className="h-5 w-5 opacity-60" aria-hidden />
              <input value={sheba} onChange={(event) => setSheba(event.target.value)} />
            </div>
          </label>

          <label className="employee-add-field employee-add-field-full">
            <span className="employee-add-field-label">شماره حساب</span>
            <input value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} />
          </label>

          <label className="employee-add-toggle-row">
            <span>حساب اصلی</span>
            <span className="request-reason-toggle employee-card-toggle">
              <input type="checkbox" checked={isPrimary} onChange={(event) => setIsPrimary(event.target.checked)} />
              <span className="request-reason-toggle-track" aria-hidden />
            </span>
          </label>

          <div className="employee-modal-actions">
            <button type="button" className="employee-modal-cancel" onClick={() => setModalOpen(false)}>
              انصراف
            </button>
            <button type="button" className="employee-modal-submit" disabled={pending || !bankName.trim() || !cardValid} onClick={handleSubmit}>
              ثبت
            </button>
          </div>
        </div>
      </EmployeeModal>

    </div>
  );
}
