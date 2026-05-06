'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  nationalCode?: string;
  mobile?: string;
  email?: string;
  isActive: boolean;
};

type Props = {
  employees: Employee[];
};

export function EmployeeList({ employees: initialEmployees }: Props) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || emp.nationalCode?.includes(query) || emp.mobile?.includes(query) || emp.email?.toLowerCase().includes(query);
  });

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/employees/${id}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to toggle status');

      setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, isActive: !currentStatus } : emp)));
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('خطا در تغییر وضعیت کارمند');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این کارمند اطمینان دارید؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete employee');

      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (error) {
      console.error('Failed to delete employee:', error);
      alert('خطا در حذف کارمند');
    }
  };

  const getInitials = (employee: Employee) => {
    const firstInitial = employee.firstName.trim().charAt(0);
    const lastInitial = employee.lastName.trim().charAt(0);
    return `${firstInitial}${lastInitial}` || '?';
  };

  return (
    <div className="employee-list-container">
      <div className="employee-list-header">
        <div className="search-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="جستجو بر اساس نام، کد ملی، موبایل یا ایمیل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="empty-state">
          <p>{searchQuery ? 'کارمندی یافت نشد' : 'هنوز کارمندی ثبت نشده است'}</p>
        </div>
      ) : (
        <div className="employee-card-grid">
          {filteredEmployees.map((employee) => (
            <article key={employee.id} className="employee-card">
              <div className="employee-card-controls">
                <div className="employee-actions-menu">
                  <button
                    type="button"
                    className="employee-more-button"
                    aria-label="عملیات کارمند"
                    aria-expanded={openMenuId === employee.id}
                    onClick={() => setOpenMenuId((current) => (current === employee.id ? null : employee.id))}
                  >
                    <MoreVertical />
                  </button>

                  {openMenuId === employee.id ? (
                    <div className="employee-actions-popover">
                      <Link href={`/employees/${employee.id}/edit`} className="employee-action-menu-item">
                        ویرایش
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          handleDelete(employee.id);
                        }}
                        className="employee-action-menu-item is-danger"
                      >
                        حذف
                      </button>
                    </div>
                  ) : null}
                </div>

                <button
                  onClick={() => handleToggleStatus(employee.id, employee.isActive)}
                  className={`status-toggle employee-card-status ${employee.isActive ? 'active' : 'inactive'}`}
                  aria-label={employee.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                >
                  <span className="status-toggle-track">
                    <span className="status-toggle-thumb" />
                  </span>
                  <span className="status-toggle-label">{employee.isActive ? 'فعال' : 'غیرفعال'}</span>
                </button>
              </div>

              <div className="employee-card-main">
                <div className="employee-avatar" aria-hidden="true">
                  {getInitials(employee)}
                </div>
                <div className="employee-card-identity">
                  <Link href={`/employees/${employee.id}`} className="employee-name-link">
                    {`${employee.firstName} ${employee.lastName}`}
                  </Link>
                  <div className="employee-card-contact">
                    <span dir="ltr">{employee.mobile || '-'}</span>
                    <span dir="ltr">{employee.email || '-'}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
