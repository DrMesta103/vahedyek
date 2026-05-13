'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ReceiptText, Search, WalletCards } from 'lucide-react';
import PanelLayout from '../../components/PanelLayout';
import { getContractsList } from '../../lib/contractDraftClient';
import { getReceiptsStorageKey, normalizeReceiptRecords, type RegisteredReceiptRecord } from '../../lib/contractReceipts';
import type { ContractStatus } from '../../types/contract';

type ContractLite = {
  id: string;
  status: ContractStatus;
  data: {
    subject?: { contractNumber?: string };
    parties?: { partyTwo?: Array<{ name?: string; isPrimary?: boolean }> };
  };
};

type PaymentRow = RegisteredReceiptRecord & {
  contractNumber: string;
  buyerName: string;
};

function formatMoneyRial(value: number) {
  return `${Math.round(Number(value) || 0).toLocaleString('fa-IR')} ریال`;
}

function transferKindLabel(kind: RegisteredReceiptRecord['transferKind']) {
  switch (kind) {
    case 'card_to_card':
      return 'کارت به کارت';
    case 'account_transfer':
      return 'حساب به حساب';
    case 'remittance':
      return 'حواله';
    case 'cheque':
      return 'چک';
    case 'cash':
      return 'نقد';
    default:
      return 'پرداخت';
  }
}

export default function PaymentsPage() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const results = await Promise.all(['draft', 'pending_approval', 'completed'].map((status) => getContractsList(status as ContractStatus)));
        if (!mounted) return;
        const contracts = results.flatMap((result) => result.items as ContractLite[]);
        const nextRows = contracts.flatMap((contract) => {
          const buyer = contract.data.parties?.partyTwo?.find((item) => item.isPrimary) ?? contract.data.parties?.partyTwo?.[0];
          const raw = typeof window !== 'undefined' ? window.localStorage.getItem(getReceiptsStorageKey(contract.id)) : null;
          return normalizeReceiptRecords(raw ? JSON.parse(raw) : []).map((receipt) => ({
            ...receipt,
            contractId: contract.id,
            contractNumber: contract.data.subject?.contractNumber || '—',
            buyerName: buyer?.name || receipt.depositorName || '—',
          }));
        });
        setRows(nextRows.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))));
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'دریافت واریزی مشتریان انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      [row.contractNumber, row.buyerName, row.depositorName, row.trackingNumber, row.referenceNumber, row.receiptNumber, row.destinationValue]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [query, rows]);

  const totalPaid = filteredRows.reduce((sum, row) => sum + row.paidAmountRial, 0);

  return (
    <PanelLayout>
      <main className="space-y-5" dir="rtl">
        <section className="rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--surface-overlay)] p-5 shadow-[0_18px_45px_var(--shadow-soft)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_85%,black)]">
                <WalletCards className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-2xl font-black text-[color:var(--text-strong)]">واریزی مشتریان</h1>
                <p className="mt-1 text-sm text-[color:var(--text-muted)]">فهرست فیش‌های ثبت‌شده روی قراردادها و سررسیدهای مشتریان.</p>
              </div>
            </div>
            <div className="grid gap-2 text-left sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div className="text-xs font-bold text-slate-500">تعداد فیش</div>
                <div className="mt-1 text-lg font-black text-slate-900">{filteredRows.length.toLocaleString('fa-IR')}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div className="text-xs font-bold text-slate-500">جمع واریزی</div>
                <div className="mt-1 text-lg font-black text-emerald-800">{formatMoneyRial(totalPaid)}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-4">
          <div className="relative w-full max-w-lg">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pr-10 pl-4 text-sm outline-none focus:border-[color:var(--theme-action-border)]"
              placeholder="جستجو در قرارداد، مشتری، شماره پیگیری..."
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-sm font-bold text-slate-500">در حال بارگذاری...</div>
          ) : error ? (
            <div className="p-10 text-center text-sm font-bold text-rose-700">{error}</div>
          ) : filteredRows.length === 0 ? (
            <div className="p-10 text-center text-sm font-bold text-slate-500">واریزی ثبت‌شده‌ای یافت نشد.</div>
          ) : (
            <table className="w-full min-w-[860px] text-right text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3">مشتری</th>
                  <th className="px-4 py-3">قرارداد</th>
                  <th className="px-4 py-3">مبلغ</th>
                  <th className="px-4 py-3">تاریخ واریز</th>
                  <th className="px-4 py-3">روش</th>
                  <th className="px-4 py-3">شماره پیگیری</th>
                  <th className="px-4 py-3">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-black text-slate-900">{row.buyerName}</td>
                    <td className="px-4 py-3 text-slate-700">{row.contractNumber}</td>
                    <td className="px-4 py-3 font-black tabular-nums text-emerald-800">{formatMoneyRial(row.paidAmountRial)}</td>
                    <td className="px-4 py-3 text-slate-700">{row.depositDate || row.allocationDate || '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{transferKindLabel(row.transferKind)}</td>
                    <td className="px-4 py-3 text-slate-700">{row.trackingNumber || row.referenceNumber || row.receiptNumber || '—'}</td>
                    <td className="px-4 py-3">
                      {row.contractId ? (
                        <Link href={`/contracts/${row.contractId}/dues`} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-50">
                          <ReceiptText className="h-3.5 w-3.5" />
                          سررسیدها
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </PanelLayout>
  );
}
