'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalContracts: number;
  activeContracts: number;
  totalDebt: number;
  totalPaid: number;
  nextDueDate: string | null;
  nextDueAmount: number;
  unreadNotifications: number;
  pendingReceipts: number;
}

export default function CustomerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalContracts: 0,
    activeContracts: 0,
    totalDebt: 0,
    totalPaid: 0,
    nextDueDate: null,
    nextDueAmount: 0,
    unreadNotifications: 0,
    pendingReceipts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real data from API
    setTimeout(() => {
      setStats({
        totalContracts: 2,
        activeContracts: 2,
        totalDebt: 450000000,
        totalPaid: 850000000,
        nextDueDate: '1403/10/15',
        nextDueAmount: 25000000,
        unreadNotifications: 3,
        pendingReceipts: 1,
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize: '32px', color: '#008080' }}></i>
        <p style={{ marginTop: '16px', color: '#6b7280' }}>در حال بارگذاری داشبورد...</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
  };

  return (
    <div className="customer-dashboard">
      <div className="dashboard-header">
        <h1>داشبورد خریدار</h1>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>خوش آمدید! اطلاعات کلی قراردادها و وضعیت مالی شما</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#008080' }}>
            <i className="fa fa-file-contract"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">قراردادهای فعال</div>
            <div className="stat-value">{stats.activeContracts}</div>
            <div className="stat-sublabel">از {stats.totalContracts} قرارداد</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#10b981' }}>
            <i className="fa fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">مبلغ پرداخت شده</div>
            <div className="stat-value">{formatCurrency(stats.totalPaid)}</div>
            <div className="stat-sublabel">تا به امروز</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ef4444' }}>
            <i className="fa fa-exclamation-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">مانده بدهی</div>
            <div className="stat-value">{formatCurrency(stats.totalDebt)}</div>
            <div className="stat-sublabel">در تمام قراردادها</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f59e0b' }}>
            <i className="fa fa-calendar-alt"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">نزدیک‌ترین سررسید</div>
            <div className="stat-value" style={{ fontSize: '18px' }}>
              {stats.nextDueDate || 'ندارد'}
            </div>
            <div className="stat-sublabel">{stats.nextDueAmount ? formatCurrency(stats.nextDueAmount) : ''}</div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>دسترسی سریع</h2>
        <div className="action-cards">
          <Link href="/customer-portal/contracts" className="action-card">
            <i className="fa fa-file-contract"></i>
            <span>قراردادهای من</span>
            <i className="fa fa-arrow-left"></i>
          </Link>

          <Link href="/customer-portal/financial/receipts/new" className="action-card">
            <i className="fa fa-receipt"></i>
            <span>ثبت فیش پرداختی</span>
            <i className="fa fa-arrow-left"></i>
          </Link>

          <Link href="/customer-portal/financial/due-dates" className="action-card">
            <i className="fa fa-calendar-check"></i>
            <span>سررسیدهای من</span>
            <i className="fa fa-arrow-left"></i>
          </Link>

          <Link href="/customer-portal/support/new" className="action-card">
            <i className="fa fa-headset"></i>
            <span>تیکت جدید</span>
            <i className="fa fa-arrow-left"></i>
          </Link>
        </div>
      </div>

      {stats.unreadNotifications > 0 && (
        <div className="notifications-section">
          <h2>اعلان‌های اخیر</h2>
          <div className="notification-list">
            <div className="notification-item">
              <i className="fa fa-info-circle" style={{ color: '#3b82f6' }}></i>
              <div>
                <div className="notification-title">سررسید نزدیک است</div>
                <div className="notification-text">سررسید قرارداد شماره 1001 در تاریخ {stats.nextDueDate} می‌باشد.</div>
              </div>
            </div>
            <div className="notification-item">
              <i className="fa fa-check-circle" style={{ color: '#10b981' }}></i>
              <div>
                <div className="notification-title">فیش پرداختی تایید شد</div>
                <div className="notification-text">فیش پرداختی شماره 5432 با موفقیت تایید شد.</div>
              </div>
            </div>
            {stats.pendingReceipts > 0 && (
              <div className="notification-item">
                <i className="fa fa-clock" style={{ color: '#f59e0b' }}></i>
                <div>
                  <div className="notification-title">فیش در انتظار تایید</div>
                  <div className="notification-text">{stats.pendingReceipts} فیش پرداختی در انتظار تایید است.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
