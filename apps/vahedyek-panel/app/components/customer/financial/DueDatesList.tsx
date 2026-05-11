'use client';

import { useEffect, useState } from 'react';

interface DueDate {
  id: string;
  contractNumber: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: 'paid' | 'overdue' | 'pending';
  actualPaymentDate?: string;
}

const STATUS_LABELS: Record<string, string> = {
  paid: 'پرداخت شده',
  overdue: 'معوق',
  pending: 'در انتظار',
};

const STATUS_COLORS: Record<string, string> = {
  paid: '#10b981',
  overdue: '#ef4444',
  pending: '#f59e0b',
};

export default function DueDatesList() {
  const [dueDates, setDueDates] = useState<DueDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'overdue' | 'pending'>('all');

  useEffect(() => {
    // TODO: Fetch real data from API
    setTimeout(() => {
      setDueDates([
        {
          id: '1',
          contractNumber: '1001',
          installmentNumber: 1,
          amount: 50000000,
          dueDate: '1403/09/15',
          status: 'paid',
          actualPaymentDate: '1403/09/14',
        },
        {
          id: '2',
          contractNumber: '1001',
          installmentNumber: 2,
          amount: 50000000,
          dueDate: '1403/10/15',
          status: 'pending',
        },
        {
          id: '3',
          contractNumber: '1001',
          installmentNumber: 3,
          amount: 50000000,
          dueDate: '1403/11/15',
          status: 'pending',
        },
        {
          id: '4',
          contractNumber: '1002',
          installmentNumber: 1,
          amount: 30000000,
          dueDate: '1403/08/20',
          status: 'overdue',
        },
        {
          id: '5',
          contractNumber: '1002',
          installmentNumber: 2,
          amount: 30000000,
          dueDate: '1403/09/20',
          status: 'paid',
          actualPaymentDate: '1403/09/19',
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
  };

  const filteredDueDates = filter === 'all' ? dueDates : dueDates.filter((d) => d.status === filter);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize: '32px', color: '#008080' }}></i>
        <p style={{ marginTop: '16px', color: '#6b7280' }}>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="due-dates-filters">
        <button className={`filter-btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
          همه ({dueDates.length})
        </button>
        <button className={`filter-btn${filter === 'pending' ? ' active' : ''}`} onClick={() => setFilter('pending')}>
          در انتظار ({dueDates.filter((d) => d.status === 'pending').length})
        </button>
        <button className={`filter-btn${filter === 'overdue' ? ' active' : ''}`} onClick={() => setFilter('overdue')}>
          معوق ({dueDates.filter((d) => d.status === 'overdue').length})
        </button>
        <button className={`filter-btn${filter === 'paid' ? ' active' : ''}`} onClick={() => setFilter('paid')}>
          پرداخت شده ({dueDates.filter((d) => d.status === 'paid').length})
        </button>
      </div>

      {filteredDueDates.length === 0 ? (
        <div className="empty-state">
          <i className="fa fa-calendar-check" style={{ fontSize: '64px', color: '#d1d5db' }}></i>
          <h3>سررسیدی یافت نشد</h3>
          <p>با فیلتر انتخاب شده، سررسیدی وجود ندارد.</p>
        </div>
      ) : (
        <div className="due-dates-timeline">
          {filteredDueDates.map((dueDate) => (
            <div key={dueDate.id} className={`due-date-item status-${dueDate.status}`}>
              <div className="due-date-marker">
                <div className="due-date-dot"></div>
                <div className="due-date-line"></div>
              </div>
              <div className="due-date-content">
                <div className="due-date-header">
                  <div>
                    <h4>
                      قرارداد {dueDate.contractNumber} - قسط {dueDate.installmentNumber}
                    </h4>
                    <span className="due-date-date">
                      <i className="fa fa-calendar"></i>
                      سررسید: {dueDate.dueDate}
                    </span>
                  </div>
                  <div
                    className="status-badge"
                    style={{
                      background: STATUS_COLORS[dueDate.status] + '20',
                      color: STATUS_COLORS[dueDate.status],
                    }}
                  >
                    {STATUS_LABELS[dueDate.status]}
                  </div>
                </div>
                <div className="due-date-body">
                  <div className="due-date-amount">
                    <span>مبلغ:</span>
                    <strong>{formatCurrency(dueDate.amount)}</strong>
                  </div>
                  {dueDate.actualPaymentDate && (
                    <div className="due-date-payment">
                      <i className="fa fa-check-circle"></i>
                      پرداخت شده در {dueDate.actualPaymentDate}
                    </div>
                  )}
                  {dueDate.status === 'overdue' && (
                    <div className="due-date-warning">
                      <i className="fa fa-exclamation-triangle"></i>
                      این قسط معوق است. لطفاً در اسرع وقت پرداخت کنید.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
