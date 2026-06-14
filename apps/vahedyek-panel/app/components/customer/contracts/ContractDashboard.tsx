'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { buildBuyerFinancialSummary, type BuyerFinancialSummary } from '../../../lib/contractBuyerFinancialSummary';
import { getContractDetails } from '../../../lib/contractDraftClient';
import { getReceiptsStorageKey, normalizeReceiptRecords } from '../../../lib/contractReceipts';

interface ContractDashboardProps {
  contractId: string;
}

const DASHBOARD_SECTIONS = [
  {
    id: 'text',
    title: 'متن قرارداد',
    icon: 'fa-file-alt',
    description: 'مشاهده متن کامل و جزئیات قرارداد',
    color: '#3b82f6',
  },
  {
    id: 'due-dates',
    title: 'فهرست سررسیدها',
    icon: 'fa-calendar-check',
    description: 'لیست اقساط و سررسیدهای پرداخت',
    color: '#8b5cf6',
  },
  {
    id: 'receipts',
    title: 'فیش‌های پرداختی',
    icon: 'fa-receipt',
    description: 'مشاهده و ثبت فیش‌های پرداخت',
    color: '#10b981',
  },
  {
    id: 'financial-report',
    title: 'گزارش مالی',
    icon: 'fa-chart-pie',
    description: 'خلاصه مالی امن همان قرارداد',
    color: '#f59e0b',
  },
  {
    id: 'documents',
    title: 'مدارک قرارداد',
    icon: 'fa-folder-open',
    description: 'اسناد و مدارک مرتبط',
    color: '#6366f1',
  },
  {
    id: 'payment-offers',
    title: 'روش‌های پرداخت بدهی',
    icon: 'fa-hand-holding-usd',
    description: 'پیشنهادهای تسویه و پرداخت',
    color: '#ef4444',
  },
];

function formatCurrency(amount: number) {
  return `${new Intl.NumberFormat('fa-IR').format(amount)} ریال`;
}

function statusLabel(status: string | null) {
  switch (status) {
    case 'completed':
      return 'تکمیل شده';
    case 'pending_approval':
      return 'در انتظار تأیید';
    case 'appendix_draft':
      return 'متمم پیش‌نویس';
    case 'draft':
      return 'پیش‌نویس';
    default:
      return 'فعال';
  }
}

export default function ContractDashboard({ contractId }: ContractDashboardProps) {
  const [summary, setSummary] = useState<BuyerFinancialSummary | null>(null);
  const [contractStatus, setContractStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const contract = await getContractDetails(contractId, { view: 'buyer-safe' });
        const storedReceipts = typeof window === 'undefined' ? null : window.localStorage.getItem(getReceiptsStorageKey(contractId));
        let rawReceipts: unknown = [];
        try {
          rawReceipts = storedReceipts ? JSON.parse(storedReceipts) : [];
        } catch {
          rawReceipts = [];
        }
        const receipts = normalizeReceiptRecords(rawReceipts);

        if (!mounted) return;
        setContractStatus(String(contract?.status ?? ''));
        setSummary(buildBuyerFinancialSummary(contract, receipts));
      } catch (loadError) {
        if (!mounted) return;
        setSummary(null);
        setContractStatus(null);
        setError(loadError instanceof Error ? loadError.message : 'خطا در دریافت اطلاعات قرارداد');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [contractId]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize: '32px', color: '#008080' }}></i>
        <p style={{ marginTop: '16px', color: '#6b7280' }}>در حال بارگذاری...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="empty-state">
        <i className="fa fa-exclamation-triangle" style={{ fontSize: '64px', color: '#ef4444' }}></i>
        <h3>قرارداد یافت نشد</h3>
        <p>{error || 'قرارداد مورد نظر یافت نشد یا دسترسی به آن ندارید.'}</p>
      </div>
    );
  }

  return (
    <div className="contract-dashboard">
      <div className="contract-info-header">
        <div className="contract-info-main">
          <h1>قرارداد {summary.contractNumber}</h1>
          <div className="contract-info-details">
            <span>
              <i className="fa fa-calendar"></i>
              {summary.contractDate}
            </span>
            <span>
              <i className="fa fa-tag"></i>
              {summary.contractTypeLabel}
            </span>
            <span>
              <i className="fa fa-building"></i>
              {summary.unitLabel}
            </span>
          </div>
        </div>

        <div className="contract-financial-summary">
          <div className="financial-summary-item">
            <span className="label">مبلغ کل</span>
            <span className="value">{formatCurrency(summary.totalAmountRial ?? 0)}</span>
          </div>
          <div className="financial-summary-item">
            <span className="label">وضعیت</span>
            <span className="value" style={{ color: '#0f766e' }}>
              {statusLabel(contractStatus)}
            </span>
          </div>
          <div className="financial-summary-item">
            <span className="label">پرداخت شده تأییدشده</span>
            <span className="value" style={{ color: '#10b981' }}>
              {formatCurrency(summary.confirmedPaidRial ?? 0)}
            </span>
          </div>
          <div className="financial-summary-item">
            <span className="label">مانده بدهی</span>
            <span className="value" style={{ color: '#ef4444' }}>
              {formatCurrency(summary.remainingDebtRial ?? 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-sections-grid">
        {DASHBOARD_SECTIONS.map((section) => (
          <Link
            key={section.id}
            href={`/customer-portal/contracts/${contractId}/${section.id}`}
            className="dashboard-section-card"
            style={{ borderTopColor: section.color }}
          >
            <div className="section-icon" style={{ background: `${section.color}20`, color: section.color }}>
              <i className={`fa ${section.icon}`}></i>
            </div>
            <div className="section-content">
              <h3>{section.title}</h3>
              <p>{section.description}</p>
            </div>
            <div className="section-arrow">
              <i className="fa fa-arrow-left"></i>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
