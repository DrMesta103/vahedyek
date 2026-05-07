'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ContractDashboardProps {
  contractId: string;
}

interface ContractInfo {
  contractNumber: string;
  contractDate: string;
  type: string;
  status: string;
  blockName: string;
  floorNumber: string;
  unitIdentifier: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
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
    description: 'نمودارها و گزارش‌های مالی',
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

export default function ContractDashboard({ contractId }: ContractDashboardProps) {
  const [contract, setContract] = useState<ContractInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real data from API
    setTimeout(() => {
      setContract({
        contractNumber: '1001',
        contractDate: '1402/05/12',
        type: 'پیش‌فروش',
        status: 'فعال',
        blockName: 'بلوک A',
        floorNumber: '3',
        unitIdentifier: 'واحد 12',
        totalAmount: 1500000000,
        paidAmount: 900000000,
        remainingAmount: 600000000,
      });
      setLoading(false);
    }, 500);
  }, [contractId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize: '32px', color: '#008080' }}></i>
        <p style={{ marginTop: '16px', color: '#6b7280' }}>در حال بارگذاری...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="empty-state">
        <i className="fa fa-exclamation-triangle" style={{ fontSize: '64px', color: '#ef4444' }}></i>
        <h3>قرارداد یافت نشد</h3>
        <p>قرارداد مورد نظر یافت نشد یا دسترسی به آن ندارید.</p>
      </div>
    );
  }

  return (
    <div className="contract-dashboard">
      <div className="contract-info-header">
        <div className="contract-info-main">
          <h1>قرارداد {contract.contractNumber}</h1>
          <div className="contract-info-details">
            <span>
              <i className="fa fa-calendar"></i>
              {contract.contractDate}
            </span>
            <span>
              <i className="fa fa-tag"></i>
              {contract.type}
            </span>
            <span>
              <i className="fa fa-building"></i>
              {contract.blockName} - طبقه {contract.floorNumber} - {contract.unitIdentifier}
            </span>
          </div>
        </div>

        <div className="contract-financial-summary">
          <div className="financial-summary-item">
            <span className="label">مبلغ کل</span>
            <span className="value">{formatCurrency(contract.totalAmount)}</span>
          </div>
          <div className="financial-summary-item">
            <span className="label">پرداخت شده</span>
            <span className="value" style={{ color: '#10b981' }}>
              {formatCurrency(contract.paidAmount)}
            </span>
          </div>
          <div className="financial-summary-item">
            <span className="label">مانده بدهی</span>
            <span className="value" style={{ color: '#ef4444' }}>
              {formatCurrency(contract.remainingAmount)}
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
            <div className="section-icon" style={{ background: section.color + '20', color: section.color }}>
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
