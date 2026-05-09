'use client';

import { useEffect, useState } from 'react';

interface Receipt {
  id: string;
  contractNumber: string;
  trackingNumber: string;
  bankName: string;
  amount: number;
  paymentDate: string;
  status: 'pending' | 'approved' | 'rejected';
  imageUrl: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار تایید',
  approved: 'تایید شده',
  rejected: 'رد شده',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
};

export default function ReceiptsList() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real data from API
    setTimeout(() => {
      setReceipts([
        {
          id: '1',
          contractNumber: '1001',
          trackingNumber: '123456789',
          bankName: 'بانک ملی',
          amount: 50000000,
          paymentDate: '1403/09/15',
          status: 'approved',
          imageUrl: '/receipt1.jpg',
        },
        {
          id: '2',
          contractNumber: '1002',
          trackingNumber: '987654321',
          bankName: 'بانک ملت',
          amount: 30000000,
          paymentDate: '1403/09/20',
          status: 'pending',
          imageUrl: '/receipt2.jpg',
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
        <p style={{ marginTop: '16px', color: '#6b7280' }}>در حال بارگذاری...</p>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="empty-state">
        <i className="fa fa-receipt" style={{ fontSize: '64px', color: '#d1d5db' }}></i>
        <h3>فیش پرداختی یافت نشد</h3>
        <p>شما هنوز هیچ فیش پرداختی ثبت نکرده‌اید.</p>
      </div>
    );
  }

  return (
    <div className="receipts-table-container">
      <table className="receipts-table">
        <thead>
          <tr>
            <th>شماره پیگیری</th>
            <th>قرارداد</th>
            <th>بانک</th>
            <th>مبلغ</th>
            <th>تاریخ واریز</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((receipt) => (
            <tr key={receipt.id}>
              <td>
                <span className="tracking-number">{receipt.trackingNumber}</span>
              </td>
              <td>{receipt.contractNumber}</td>
              <td>{receipt.bankName}</td>
              <td>
                <strong>{formatCurrency(receipt.amount)}</strong>
              </td>
              <td>{receipt.paymentDate}</td>
              <td>
                <span
                  className="status-badge"
                  style={{
                    background: STATUS_COLORS[receipt.status] + '20',
                    color: STATUS_COLORS[receipt.status],
                  }}
                >
                  {STATUS_LABELS[receipt.status]}
                </span>
              </td>
              <td>
                <button className="btn-icon" title="مشاهده فیش">
                  <i className="fa fa-eye"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
