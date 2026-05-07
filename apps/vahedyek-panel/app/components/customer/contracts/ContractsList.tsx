'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Contract {
  id: string;
  contractNumber: string;
  contractDate: string;
  type: 'presale' | 'rental' | 'mortgage';
  status: 'active' | 'completed' | 'suspended';
  blockName: string;
  floorNumber: string;
  unitIdentifier: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentProgress: number;
}

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  presale: 'پیش‌فروش',
  rental: 'اجاره',
  mortgage: 'رهن',
};

const CONTRACT_STATUS_LABELS: Record<string, string> = {
  active: 'فعال',
  completed: 'تکمیل شده',
  suspended: 'معلق',
};

const CONTRACT_STATUS_COLORS: Record<string, string> = {
  active: '#10b981',
  completed: '#6b7280',
  suspended: '#f59e0b',
};

export default function ContractsList() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real data from API
    setTimeout(() => {
      setContracts([
        {
          id: '1',
          contractNumber: '1001',
          contractDate: '1402/05/12',
          type: 'presale',
          status: 'active',
          blockName: 'بلوک A',
          floorNumber: '3',
          unitIdentifier: 'واحد 12',
          totalAmount: 1500000000,
          paidAmount: 900000000,
          remainingAmount: 600000000,
          paymentProgress: 60,
        },
        {
          id: '2',
          contractNumber: '1002',
          contractDate: '1402/08/20',
          type: 'presale',
          status: 'active',
          blockName: 'بلوک B',
          floorNumber: '5',
          unitIdentifier: 'واحد 8',
          totalAmount: 2000000000,
          paidAmount: 800000000,
          remainingAmount: 1200000000,
          paymentProgress: 40,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize: '32px', color: '#008080' }}></i>
        <p style={{ marginTop: '16px', color: '#6b7280' }}>در حال بارگذاری قراردادها...</p>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="empty-state">
        <i className="fa fa-file-contract" style={{ fontSize: '64px', color: '#d1d5db' }}></i>
        <h3>قراردادی یافت نشد</h3>
        <p>شما هنوز هیچ قراردادی ندارید.</p>
      </div>
    );
  }

  return (
    <div className="contracts-grid">
      {contracts.map((contract) => (
        <Link key={contract.id} href={`/customer-portal/contracts/${contract.id}`} className="contract-card">
          <div className="contract-card-header">
            <div>
              <div className="contract-number">قرارداد {contract.contractNumber}</div>
              <div className="contract-date">{contract.contractDate}</div>
            </div>
            <div
              className="contract-status-badge"
              style={{
                background: CONTRACT_STATUS_COLORS[contract.status] + '20',
                color: CONTRACT_STATUS_COLORS[contract.status],
              }}
            >
              {CONTRACT_STATUS_LABELS[contract.status]}
            </div>
          </div>

          <div className="contract-card-body">
            <div className="contract-property">
              <i className="fa fa-building"></i>
              <span>
                {contract.blockName} - طبقه {contract.floorNumber} - {contract.unitIdentifier}
              </span>
            </div>

            <div className="contract-type">
              <i className="fa fa-tag"></i>
              <span>{CONTRACT_TYPE_LABELS[contract.type]}</span>
            </div>

            <div className="contract-financial">
              <div className="financial-row">
                <span>مبلغ کل:</span>
                <strong>{formatCurrency(contract.totalAmount)}</strong>
              </div>
              <div className="financial-row">
                <span>پرداخت شده:</span>
                <strong style={{ color: '#10b981' }}>{formatCurrency(contract.paidAmount)}</strong>
              </div>
              <div className="financial-row">
                <span>مانده:</span>
                <strong style={{ color: '#ef4444' }}>{formatCurrency(contract.remainingAmount)}</strong>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-header">
                <span>پیشرفت پرداخت</span>
                <span className="progress-percentage">{contract.paymentProgress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${contract.paymentProgress}%` }}></div>
              </div>
            </div>
          </div>

          <div className="contract-card-footer">
            <span>مشاهده جزئیات</span>
            <i className="fa fa-arrow-left"></i>
          </div>
        </Link>
      ))}
    </div>
  );
}
