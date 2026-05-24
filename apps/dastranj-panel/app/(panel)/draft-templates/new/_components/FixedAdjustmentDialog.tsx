'use client';

import { ChevronDown, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PanelFormModal, PanelFormModalActions } from '../../../../components/PanelFormModal';
import {
  createEmptyFixedAdjustment,
  type FixedAdjustmentCalculationMethod,
  type FixedAdjustmentItem,
  type FixedAdjustmentItemType,
} from './fixed-adjustment-types';

type FixedAdjustmentDialogProps = {
  open: boolean;
  defaultItemType: FixedAdjustmentItemType;
  initialItem?: FixedAdjustmentItem | null;
  onClose: () => void;
  onConfirm: (item: FixedAdjustmentItem) => void;
};

function normalizeDigitsOnly(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/\D/g, '');
}

function normalizeDecimal(value: string) {
  const latin = value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[^\d.]/g, '');
  const [whole, ...rest] = latin.split('.');
  return rest.length ? `${whole}.${rest.join('')}` : whole;
}

export function FixedAdjustmentDialog({ open, defaultItemType, initialItem = null, onClose, onConfirm }: FixedAdjustmentDialogProps) {
  const amountRef = useRef<HTMLInputElement>(null);
  const coefficientRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [itemType, setItemType] = useState<FixedAdjustmentItemType>('addition');
  const [calculationMethod, setCalculationMethod] = useState<FixedAdjustmentCalculationMethod>('fixed_amount');
  const [amount, setAmount] = useState('');
  const [coefficient, setCoefficient] = useState('');
  const [insurance, setInsurance] = useState(true);
  const [tax, setTax] = useState(true);
  const [inBase, setInBase] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initialItem) {
      setTitle(initialItem.title);
      setItemType(initialItem.itemType);
      setCalculationMethod(initialItem.calculationMethod);
      setAmount(initialItem.amount);
      setCoefficient(initialItem.coefficient);
      setInsurance(initialItem.insurance);
      setTax(initialItem.tax);
      setInBase(initialItem.inBase);
    } else {
      const empty = createEmptyFixedAdjustment(defaultItemType);
      setTitle(empty.title);
      setItemType(empty.itemType);
      setCalculationMethod(empty.calculationMethod);
      setAmount(empty.amount);
      setCoefficient(empty.coefficient);
      setInsurance(empty.insurance);
      setTax(empty.tax);
      setInBase(empty.inBase);
    }
    setError(null);
  }, [defaultItemType, initialItem, open]);

  const handleConfirm = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('عنوان الزامی است.');
      return;
    }
    if (calculationMethod === 'fixed_amount' && !amount.trim()) {
      setError('مبلغ الزامی است.');
      return;
    }
    if (calculationMethod === 'base_coefficient' && !coefficient.trim()) {
      setError('ضریب الزامی است.');
      return;
    }

    onConfirm({
      id: initialItem?.id ?? crypto.randomUUID(),
      title: trimmedTitle,
      itemType,
      calculationMethod,
      amount: normalizeDigitsOnly(amount),
      coefficient: normalizeDecimal(coefficient),
      insurance,
      tax,
      inBase: calculationMethod === 'base_coefficient' ? inBase : false,
    });
    onClose();
  };

  return (
    <PanelFormModal
      open={open}
      title="افزودن اضافات و کسورات ثابت"
      onClose={onClose}
      error={error}
      footer={
        <PanelFormModalActions
          submitLabel="تایید"
          cancelLabel="لغو"
          onSubmit={handleConfirm}
          onCancel={onClose}
        />
      }
    >
      <div className="draft-template-fixed-adjustment-form">
        <label className="calendar-create-field">
          <span>
            عنوان <em>*</em>
          </span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>

        <label className="calendar-create-field draft-template-fixed-adjustment-select-wrap">
          <span>نوع آیتم</span>
          <select value={itemType} onChange={(event) => setItemType(event.target.value as FixedAdjustmentItemType)}>
            <option value="addition">اضافه</option>
            <option value="deduction">کسور</option>
          </select>
          <ChevronDown className="draft-template-fixed-adjustment-select-icon h-4 w-4" aria-hidden />
        </label>

        <label className="calendar-create-field draft-template-fixed-adjustment-select-wrap">
          <span>روش محاسبه</span>
          <select
            value={calculationMethod}
            onChange={(event) => setCalculationMethod(event.target.value as FixedAdjustmentCalculationMethod)}
          >
            <option value="fixed_amount">مبلغ ثابت</option>
            <option value="base_coefficient">ضریبی از مزد مبنا</option>
          </select>
          <ChevronDown className="draft-template-fixed-adjustment-select-icon h-4 w-4" aria-hidden />
        </label>

        {calculationMethod === 'fixed_amount' ? (
          <label className="calendar-create-field">
            <span>
              مبلغ <em>*</em>
            </span>
            <div className="draft-template-fixed-adjustment-amount-input">
              <input
                ref={amountRef}
                value={amount}
                inputMode="numeric"
                onChange={(event) => setAmount(normalizeDigitsOnly(event.target.value))}
              />
              {amount ? (
                <button
                  type="button"
                  className="draft-template-fixed-adjustment-clear"
                  aria-label="پاک کردن مبلغ"
                  onClick={() => setAmount('')}
                >
                  <X className="h-4 w-4" strokeWidth={2.1} />
                </button>
              ) : null}
            </div>
          </label>
        ) : (
          <label className="calendar-create-field">
            <span>
              ضریب <em>*</em>
            </span>
            <div className="draft-template-fixed-adjustment-amount-input">
              <input
                ref={coefficientRef}
                value={coefficient}
                inputMode="decimal"
                onChange={(event) => setCoefficient(normalizeDecimal(event.target.value))}
              />
              {coefficient ? (
                <button
                  type="button"
                  className="draft-template-fixed-adjustment-clear"
                  aria-label="پاک کردن ضریب"
                  onClick={() => setCoefficient('')}
                >
                  <X className="h-4 w-4" strokeWidth={2.1} />
                </button>
              ) : null}
            </div>
          </label>
        )}

        <div className="draft-template-fixed-adjustment-pills">
          <label className={insurance ? 'is-selected' : ''}>
            <input type="checkbox" checked={insurance} onChange={(event) => setInsurance(event.currentTarget.checked)} />
            <span aria-hidden>{insurance ? '✓' : ''}</span>
            مشمول بیمه
          </label>
          <label className={tax ? 'is-selected' : ''}>
            <input type="checkbox" checked={tax} onChange={(event) => setTax(event.currentTarget.checked)} />
            <span aria-hidden>{tax ? '✓' : ''}</span>
            مشمول مالیات
          </label>
          {calculationMethod === 'base_coefficient' ? (
            <label className={inBase ? 'is-selected' : ''}>
              <input type="checkbox" checked={inBase} onChange={(event) => setInBase(event.currentTarget.checked)} />
              <span aria-hidden>{inBase ? '✓' : ''}</span>
              قابل احتساب در مزد مبنا
            </label>
          ) : null}
        </div>
      </div>
    </PanelFormModal>
  );
}
