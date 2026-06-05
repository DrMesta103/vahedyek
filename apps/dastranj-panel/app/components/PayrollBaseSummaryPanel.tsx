'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, Lock } from 'lucide-react';
import { PanelFormModal, PanelFormModalActions } from './PanelFormModal';
import { formatFaNumber } from '../lib/format-fa';
import type { PaymentEffect } from '../lib/payroll-business-settings';

export type PayrollBaseSummaryItem = {
  id: string;
  title: string;
  amount: number;
  paymentEffect: PaymentEffect;
  includedInWageBase: boolean;
  system?: boolean;
  note?: string;
};

type SummaryDialogKind = 'wageBase' | 'earnings' | null;

function money(value: number) {
  return `${formatFaNumber(Math.round(value))} ریال`;
}

function SummaryItemRow({ item }: { item: PayrollBaseSummaryItem }) {
  return (
    <article className="payroll-base-summary-item">
      <div className="payroll-base-summary-item-head">
        <div className="payroll-base-summary-item-title">
          <strong>{item.title}</strong>
          {item.system ? (
            <span className="payroll-base-summary-system-tag">
              <Lock className="h-3 w-3" aria-hidden />
              سیستمی
            </span>
          ) : null}
        </div>
        <strong>{money(item.amount)}</strong>
      </div>
      {item.note ? <small>{item.note}</small> : null}
    </article>
  );
}

function SummaryDialog({
  open,
  title,
  lead,
  items,
  emptyMessage,
  onClose,
}: {
  open: boolean;
  title: string;
  lead: string;
  items: PayrollBaseSummaryItem[];
  emptyMessage: string;
  onClose: () => void;
}) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <PanelFormModal
      open={open}
      title={title}
      lead={lead}
      onClose={onClose}
      footer={<PanelFormModalActions submitLabel="بستن" onSubmit={onClose} onCancel={onClose} />}
    >
      <div className="payroll-base-summary-dialog">
        {items.length ? (
          items.map((item) => <SummaryItemRow key={item.id} item={item} />)
        ) : (
          <p className="payroll-base-summary-empty">{emptyMessage}</p>
        )}
        <div className="payroll-base-summary-total">
          <span>جمع</span>
          <strong>{money(total)}</strong>
        </div>
      </div>
    </PanelFormModal>
  );
}

export function PayrollBaseSummaryPanel({
  baseSalaryAmount,
  items,
  className = '',
}: {
  baseSalaryAmount: number;
  items: PayrollBaseSummaryItem[];
  className?: string;
}) {
  const [dialog, setDialog] = useState<SummaryDialogKind>(null);

  const wageBaseItems = useMemo(
    () => [
      {
        id: 'base-salary',
        title: 'حقوق پایه - سیستمی',
        amount: baseSalaryAmount,
        paymentEffect: 'earning' as PaymentEffect,
        includedInWageBase: true,
        system: true,
        note: 'روزانه × ۳۰ روز',
      },
      ...items.filter((item) => item.paymentEffect === 'earning' && item.includedInWageBase),
    ],
    [baseSalaryAmount, items],
  );

  const earningItems = useMemo(
    () => [
      {
        id: 'base-salary',
        title: 'حقوق پایه - سیستمی',
        amount: baseSalaryAmount,
        paymentEffect: 'earning' as PaymentEffect,
        includedInWageBase: true,
        system: true,
        note: 'روزانه × ۳۰ روز',
      },
      ...items.filter((item) => item.paymentEffect === 'earning'),
    ],
    [baseSalaryAmount, items],
  );

  const wageBaseAmount = wageBaseItems.reduce((sum, item) => sum + item.amount, 0);
  const totalEarningAmount = earningItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className={`payroll-base-summary ${className}`.trim()}>
      <article className="draft-template-flow-report-card payroll-base-summary-card accent">
        <div className="payroll-base-summary-card-head">
          <div className="payroll-base-summary-card-copy">
            <span>مزد مبنا</span>
            <strong>{money(wageBaseAmount)}</strong>
            <small>حقوق پایه + آیتم‌های افزاینده‌ای که جزو مزد مبنا شده‌اند</small>
          </div>
          <button type="button" className="payroll-base-summary-link" onClick={() => setDialog('wageBase')}>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            مشاهده جزئیات
          </button>
        </div>
      </article>
      <article className="draft-template-flow-report-card payroll-base-summary-card total">
        <div className="payroll-base-summary-card-head">
          <div className="payroll-base-summary-card-copy">
            <span>جمع حقوق دریافتی</span>
            <strong>{money(totalEarningAmount)}</strong>
            <small>همه آیتم‌های افزاینده دریافتی کارمند</small>
          </div>
          <button type="button" className="payroll-base-summary-link" onClick={() => setDialog('earnings')}>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            مشاهده جزئیات
          </button>
        </div>
      </article>

      <SummaryDialog
        open={dialog === 'wageBase'}
        title="جزئیات مزد مبنا"
        lead="حقوق پایه و آیتم‌هایی که در محاسبه مزد مبنا لحاظ می‌شوند."
        items={wageBaseItems}
        emptyMessage="مورد دیگری به جز حقوق پایه ثبت نشده است."
        onClose={() => setDialog(null)}
      />
      <SummaryDialog
        open={dialog === 'earnings'}
        title="جزئیات جمع حقوق دریافتی"
        lead="همه آیتم‌های افزاینده دریافتی کارمند."
        items={earningItems}
        emptyMessage="مورد دیگری به جز حقوق پایه ثبت نشده است."
        onClose={() => setDialog(null)}
      />
    </div>
  );
}
