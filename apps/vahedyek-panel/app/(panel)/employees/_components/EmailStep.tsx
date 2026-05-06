'use client';

import { useState } from 'react';

type Props = {
  value: string;
  onNext: (email: string) => void;
  onBack: () => void;
};

export function EmailStep({ value, onNext, onBack }: Props) {
  const [email, setEmail] = useState(value);
  const [error, setError] = useState('');

  const validateEmail = (email: string): { valid: boolean; error?: string } => {
    const cleaned = email.trim();
    if (!cleaned) {
      return { valid: false, error: 'ایمیل الزامی است' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleaned)) {
      return { valid: false, error: 'فرمت ایمیل صحیح نیست' };
    }
    return { valid: true };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validateEmail(email);
    if (!validation.valid) {
      setError(validation.error || '');
      return;
    }

    onNext(email.trim());
  };

  return (
    <div className="wizard-step-card">
      <div className="wizard-step-header">
        <h2>آدرس ایمیل</h2>
        <p>ایمیل کارمند برای ارتباطات سیستمی استفاده می‌شود</p>
      </div>

      <form onSubmit={handleSubmit} className="wizard-form">
        <div className="wizard-field">
          <label htmlFor="email">ایمیل</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="example@company.com"
            autoFocus
            dir="ltr"
            className="wizard-input"
          />
          {error && <span className="field-error">{error}</span>}
        </div>

        <div className="wizard-actions">
          <button type="button" onClick={onBack} className="wizard-btn-secondary">
            مرحله قبل
          </button>
          <button type="submit" className="wizard-btn-primary" disabled={!email.trim()}>
            مرحله بعد
          </button>
        </div>
      </form>
    </div>
  );
}
