'use client';

import { useState } from 'react';
import { ImageUpload } from './ImageUpload';

export type EmployeeFormData = {
  mobile: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
};

type Props = {
  formData: EmployeeFormData;
  onEdit: (field: string) => void;
  onUpdateData: (data: Partial<EmployeeFormData>) => void;
  onBack: () => void;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
};

export function SummaryStep({ formData, onEdit, onUpdateData, onBack, onSubmit }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت کارمند');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wizard-step-card">
      <div className="wizard-step-header">
        <h2>بررسی و تأیید نهایی</h2>
        <p>اطلاعات وارد شده را بررسی کنید</p>
      </div>

      <div className="wizard-summary">
        <div className="summary-avatar-section">
          <ImageUpload currentUrl={formData.avatarUrl} onUpload={(url) => onUpdateData({ avatarUrl: url })} />
        </div>

        <div className="summary-field">
          <div className="summary-field-header">
            <span className="summary-label">شماره موبایل</span>
            <button
              type="button"
              onClick={() => onEdit('mobile')}
              className="summary-edit-btn"
              aria-label="ویرایش شماره موبایل"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
          <span className="summary-value" dir="ltr">
            {formData.mobile}
          </span>
        </div>

        <div className="summary-field">
          <div className="summary-field-header">
            <span className="summary-label">نام و نام خانوادگی</span>
            <button
              type="button"
              onClick={() => onEdit('name')}
              className="summary-edit-btn"
              aria-label="ویرایش نام"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
          <span className="summary-value">{`${formData.firstName} ${formData.lastName}`}</span>
        </div>

        <div className="summary-field">
          <div className="summary-field-header">
            <span className="summary-label">ایمیل</span>
            <button
              type="button"
              onClick={() => onEdit('email')}
              className="summary-edit-btn"
              aria-label="ویرایش ایمیل"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
          <span className="summary-value" dir="ltr">
            {formData.email}
          </span>
        </div>

        {error && <div className="wizard-error">{error}</div>}

        <div className="wizard-actions">
          <button type="button" onClick={onBack} className="wizard-btn-secondary" disabled={isSubmitting}>
            مرحله قبل
          </button>
          <button type="button" onClick={handleSubmit} className="wizard-btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'در حال ثبت...' : 'ثبت کارمند'}
          </button>
        </div>
      </div>
    </div>
  );
}
