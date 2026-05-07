'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  lastReply: string;
}

const STATUS_LABELS: Record<string, string> = {
  open: 'باز',
  in_progress: 'در حال بررسی',
  closed: 'بسته شده',
};

const STATUS_COLORS: Record<string, string> = {
  open: '#3b82f6',
  in_progress: '#f59e0b',
  closed: '#6b7280',
};

export default function SupportTicketsList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real data from API
    setTimeout(() => {
      setTickets([
        {
          id: '1',
          subject: 'سوال درباره سررسید قرارداد',
          category: 'مالی',
          status: 'in_progress',
          createdAt: '1403/09/20',
          lastReply: '1403/09/21',
        },
        {
          id: '2',
          subject: 'درخواست تغییر تاریخ تحویل',
          category: 'قرارداد',
          status: 'open',
          createdAt: '1403/09/22',
          lastReply: '1403/09/22',
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize: '32px', color: '#008080' }}></i>
        <p style={{ marginTop: '16px', color: '#6b7280' }}>در حال بارگذاری...</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="empty-state">
        <i className="fa fa-headset" style={{ fontSize: '64px', color: '#d1d5db' }}></i>
        <h3>تیکتی یافت نشد</h3>
        <p>شما هنوز هیچ تیکت پشتیبانی ایجاد نکرده‌اید.</p>
      </div>
    );
  }

  return (
    <div className="tickets-list">
      {tickets.map((ticket) => (
        <Link key={ticket.id} href={`/customer-portal/support/${ticket.id}`} className="ticket-card">
          <div className="ticket-header">
            <div className="ticket-info">
              <h3>{ticket.subject}</h3>
              <div className="ticket-meta">
                <span>
                  <i className="fa fa-tag"></i>
                  {ticket.category}
                </span>
                <span>
                  <i className="fa fa-calendar"></i>
                  {ticket.createdAt}
                </span>
              </div>
            </div>
            <div
              className="status-badge"
              style={{
                background: STATUS_COLORS[ticket.status] + '20',
                color: STATUS_COLORS[ticket.status],
              }}
            >
              {STATUS_LABELS[ticket.status]}
            </div>
          </div>
          <div className="ticket-footer">
            <span>آخرین پاسخ: {ticket.lastReply}</span>
            <i className="fa fa-arrow-left"></i>
          </div>
        </Link>
      ))}
    </div>
  );
}
