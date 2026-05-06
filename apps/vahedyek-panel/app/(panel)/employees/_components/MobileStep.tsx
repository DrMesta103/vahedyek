'use client';

import { useState } from 'react';

type Props = {
  value: string;
  onNext: (mobile: string) => void;
};

export function MobileStep({ value, onNext }: Props) {
  const [mobile, setMobile] = useState(value);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const validateMobile = (mobile: string): { valid: boolean; error?: string } => {
    const cleaned = mobile.trim();
    if (!cleaned) {
      return { valid: false, error: 'شماره موبایل الزامی است' };
    }
    if (!/^09\d{9}$/.test(cleaned)) {
      return { valid: false, error: 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود' };
    }
    return { valid: true };
  };

  const checkDuplicate = async (mobile: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/employees/check-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      if (!response.ok) throw new Error('Failed to check mobile');
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking mobile:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validateMobile(mobile);
    if (!validation.valid) {
      setError(validation.error || '');
      return;
    }

    setIsChecking(true);
    const isDuplicate = await checkDuplicate(mobile);
    setIsChecking(false);

    if (isDuplicate) {
      setError('این شماره موبایل قبلاً ثبت شده است');
      return;
    }

    onNext(mobile);
  };

  return (
    <div className="wizard-step-card">
      <div className="wizard-step-header">
        <h2>شماره موبایل کارمند</h2>
        <p>لطفاً شماره موبایل ۱۱ رقمی را وارد کنید</p>
      </div>

      <form onSubmit={handleSubmit} className="wizard-form">
        <div className="wizard-field">
          <label htmlFor="mobile">شماره موبایل</label>
          <input
            id="mobile"
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="09123456789"
            maxLength={11}
            autoFocus
            dir="ltr"
            className="wizard-input"
          />
          {error && <span className="field-error">{error}</span>}
        </div>

        <div className="wizard-actions">
          <button type="submit" className="wizard-btn-primary" disabled={isChecking || !mobile}>
            {isChecking ? 'در حال بررسی...' : 'مرحله بعد'}
          </button>
        </div>
      </form>
    </div>
  );
}
