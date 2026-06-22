'use client';

import { useMemo, useState, useTransition } from 'react';
import { Building2, FileText, Layers, Pencil, Search, Trash2 } from 'lucide-react';
import { ModulePageHeader } from '../../../components/module-page/ModulePageHeader';
import { saveEmployeeGuaranteesAction } from '../../../lib/actions';
import {
  type EmployeeCheckGuarantee,
  type EmployeeGuarantee,
  type EmployeePromissoryGuarantee,
  formatAmount,
} from '../../../lib/employee-records';
import { formatPersianDate } from '../../../lib/format-date';
import { EmployeeModal } from './EmployeeModal';

type GuaranteeTab = 'check' | 'promissory';

type EmployeeGuaranteeManagerProps = {
  employeeId: string;
  initialGuarantees: EmployeeGuarantee[];
};

function createGuaranteeId() {
  return `gr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function EmployeeGuaranteeManager({ employeeId, initialGuarantees }: EmployeeGuaranteeManagerProps) {
  const [guarantees, setGuarantees] = useState(initialGuarantees);
  const [tab, setTab] = useState<GuaranteeTab>('check');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [promissoryNumber, setPromissoryNumber] = useState('');
  const [amount, setAmount] = useState('');

  const checks = useMemo(() => guarantees.filter((item) => item.kind === 'check'), [guarantees]);
  const promissories = useMemo(() => guarantees.filter((item) => item.kind === 'promissory'), [guarantees]);
  const visibleItems = tab === 'check' ? checks : promissories;

  const resetForm = () => {
    setBankName('');
    setAccountHolderName('');
    setCheckNumber('');
    setPromissoryNumber('');
    setAmount('');
    setEditingId(null);
  };

  const persist = (next: EmployeeGuarantee[]) => {
    setGuarantees(next);
    const formData = new FormData();
    formData.set('employeeId', employeeId);
    formData.set('guarantees', JSON.stringify(next));
    startTransition(() => {
      void saveEmployeeGuaranteesAction(formData);
    });
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (item: EmployeeGuarantee) => {
    setEditingId(item.id);
    setAmount(item.amount);
    if (item.kind === 'check') {
      setBankName(item.bankName);
      setAccountHolderName(item.accountHolderName);
      setCheckNumber(item.checkNumber);
    } else {
      setPromissoryNumber(item.promissoryNumber);
    }
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!amount.trim()) return;

    if (tab === 'check') {
      if (!bankName.trim() || !accountHolderName.trim() || !checkNumber.trim()) return;
      const payload: EmployeeCheckGuarantee = {
        id: editingId ?? createGuaranteeId(),
        kind: 'check',
        bankName: bankName.trim(),
        accountHolderName: accountHolderName.trim(),
        checkNumber: checkNumber.trim(),
        amount: amount.trim(),
        createdAt: editingId
          ? (guarantees.find((item) => item.id === editingId) as EmployeeCheckGuarantee | undefined)?.createdAt ?? new Date().toISOString()
          : new Date().toISOString(),
      };
      const next = editingId
        ? guarantees.map((item) => (item.id === editingId ? payload : item))
        : [...guarantees, payload];
      persist(next);
    } else {
      if (!promissoryNumber.trim()) return;
      const payload: EmployeePromissoryGuarantee = {
        id: editingId ?? createGuaranteeId(),
        kind: 'promissory',
        promissoryNumber: promissoryNumber.trim(),
        amount: amount.trim(),
        createdAt: editingId
          ? (guarantees.find((item) => item.id === editingId) as EmployeePromissoryGuarantee | undefined)?.createdAt ?? new Date().toISOString()
          : new Date().toISOString(),
      };
      const next = editingId
        ? guarantees.map((item) => (item.id === editingId ? payload : item))
        : [...guarantees, payload];
      persist(next);
    }

    setModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    persist(guarantees.filter((item) => item.id !== id));
  };

  const modalTitle = tab === 'check' ? 'افزودن چک کارمند' : 'افزودن سفته کارمند';

  return (
    <div className="employee-sub-page">
      <ModulePageHeader
        title="ضمانت کارمند"
        subtitle="مدیریت چک‌ها و سفته‌های ثبت‌شده برای هر کارمند"
        titleHref={`/employees/${employeeId}`}
      />

      <div className="employee-sub-toolbar">
        <button type="button" className="employee-sub-search-btn" aria-label="جستجو">
          <Search className="h-5 w-5" />
        </button>
        <button type="button" className="module-page-add-btn" onClick={openCreate}>
          <span aria-hidden>+</span>
          {tab === 'check' ? 'افزودن چک' : 'افزودن سفته'}
        </button>
      </div>

      <div className="employee-guarantee-tabs">
        <button
          type="button"
          className={`employee-guarantee-tab${tab === 'check' ? ' is-active' : ''}`}
          onClick={() => setTab('check')}
        >
          <strong>چک‌های کارمند</strong>
          <span>مدیریت چک‌های ثبت‌شده برای هر کارمند</span>
        </button>
        <button
          type="button"
          className={`employee-guarantee-tab${tab === 'promissory' ? ' is-active' : ''}`}
          onClick={() => setTab('promissory')}
        >
          <strong>سفته‌های کارمند</strong>
          <span>مدیریت سفته‌های ثبت‌شده برای هر کارمند</span>
        </button>
      </div>

      <div className="employee-sub-grid">
        {visibleItems.map((item) =>
          item.kind === 'check' ? (
            <article key={item.id} className="employee-guarantee-card">
              <div className="employee-guarantee-card-top">
                <div className="employee-bank-card-actions">
                  <button type="button" className="request-reason-icon-btn" aria-label="ویرایش" onClick={() => openEdit(item)}>
                    <Pencil className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                  <button type="button" className="request-reason-icon-btn is-danger" aria-label="حذف" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                </div>
                <div className="employee-bank-card-bank">
                  <Building2 className="h-5 w-5" />
                  <strong>{item.bankName}</strong>
                </div>
              </div>
              <div className="employee-bank-card-body">
                <div className="employee-detail-row">
                  <span className="employee-detail-label">نام صاحب حساب:</span>
                  <span className="employee-detail-value">{item.accountHolderName}</span>
                </div>
                <div className="employee-detail-row">
                  <span className="employee-detail-label">شماره چک:</span>
                  <span className="employee-detail-value">{item.checkNumber}</span>
                </div>
                <div className="employee-detail-row">
                  <span className="employee-detail-label">مبلغ:</span>
                  <span className="employee-detail-value">{formatAmount(item.amount)}</span>
                </div>
                <div className="employee-detail-row">
                  <span className="employee-detail-label">تاریخ ایجاد:</span>
                  <span className="employee-detail-value">{formatPersianDate(item.createdAt)}</span>
                </div>
              </div>
            </article>
          ) : (
            <article key={item.id} className="employee-guarantee-card">
              <div className="employee-guarantee-card-top">
                <div className="employee-bank-card-actions">
                  <button type="button" className="request-reason-icon-btn" aria-label="ویرایش" onClick={() => openEdit(item)}>
                    <Pencil className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                  <button type="button" className="request-reason-icon-btn is-danger" aria-label="حذف" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                </div>
                <div className="employee-guarantee-promissory-icon" aria-hidden>
                  <FileText className="h-6 w-6" />
                </div>
              </div>
              <div className="employee-bank-card-body">
                <div className="employee-detail-row">
                  <span className="employee-detail-label">شماره سفته:</span>
                  <span className="employee-detail-value">{item.promissoryNumber}</span>
                </div>
                <div className="employee-detail-row">
                  <span className="employee-detail-label">مبلغ:</span>
                  <span className="employee-detail-value">{formatAmount(item.amount)}</span>
                </div>
                <div className="employee-detail-row">
                  <span className="employee-detail-label">تاریخ ایجاد:</span>
                  <span className="employee-detail-value">{formatPersianDate(item.createdAt)}</span>
                </div>
              </div>
            </article>
          ),
        )}

        <button type="button" className="module-add-tile employee-sub-add-tile" onClick={openCreate}>
          <span className="module-add-tile-icon">
            <Layers className="h-7 w-7" strokeWidth={2.2} />
          </span>
          <span className="module-add-tile-text">{tab === 'check' ? 'برای افزودن چک کلیک کنید.' : 'برای افزودن سفته کلیک کنید.'}</span>
        </button>
      </div>

      <EmployeeModal open={modalOpen} title={editingId ? 'ویرایش' : modalTitle} onClose={() => { setModalOpen(false); resetForm(); }}>
        <div className="employee-modal-form">
          {tab === 'check' ? (
            <>
              <label className="employee-add-field employee-add-field-full">
                <span className="employee-add-field-label">
                  نام بانک <span className="employee-add-required">*</span>
                </span>
                <input value={bankName} onChange={(event) => setBankName(event.target.value)} />
              </label>
              <label className="employee-add-field employee-add-field-full">
                <span className="employee-add-field-label">
                  نام صاحب حساب <span className="employee-add-required">*</span>
                </span>
                <input value={accountHolderName} onChange={(event) => setAccountHolderName(event.target.value)} />
              </label>
              <label className="employee-add-field employee-add-field-full">
                <span className="employee-add-field-label">
                  شماره چک <span className="employee-add-required">*</span>
                </span>
                <input value={checkNumber} onChange={(event) => setCheckNumber(event.target.value)} />
              </label>
            </>
          ) : (
            <label className="employee-add-field employee-add-field-full">
              <span className="employee-add-field-label">
                شماره سفته <span className="employee-add-required">*</span>
              </span>
              <input value={promissoryNumber} onChange={(event) => setPromissoryNumber(event.target.value)} />
            </label>
          )}

          <label className="employee-add-field employee-add-field-full">
            <span className="employee-add-field-label">
              مبلغ <span className="employee-add-required">*</span>
            </span>
            <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="numeric" />
          </label>

          <div className="employee-modal-actions">
            <button type="button" className="employee-modal-cancel" onClick={() => setModalOpen(false)}>
              انصراف
            </button>
            <button type="button" className="employee-modal-submit" disabled={pending} onClick={handleSubmit}>
              {tab === 'check' ? 'افزودن' : 'افزودن'}
            </button>
          </div>
        </div>
      </EmployeeModal>
    </div>
  );
}
