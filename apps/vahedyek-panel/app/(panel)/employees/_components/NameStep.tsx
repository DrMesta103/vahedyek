'use client';

import { useState } from 'react';

type Props = {
  firstName: string;
  lastName: string;
  onNext: (firstName: string, lastName: string) => void;
  onBack: () => void;
};

export function NameStep({ firstName: initialFirstName, lastName: initialLastName, onNext, onBack }: Props) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [errors, setErrors] = useState({ firstName: '', lastName: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { firstName: '', lastName: '' };

    if (!firstName.trim()) {
      newErrors.firstName = 'نام الزامی است';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'نام خانوادگی الزامی است';
    }

    if (newErrors.firstName || newErrors.lastName) {
      setErrors(newErrors);
      return;
    }

    onNext(firstName.trim(), lastName.trim());
  };

  return (
    <div className="wizard-step-card">
      <div className="wizard-step-header">
        <h2>نام و نام خانوادگی</h2>
        <p>اطلاعات هویتی کارمند را وارد کنید</p>
      </div>

      <form onSubmit={handleSubmit} className="wizard-form">
        <div className="wizard-field">
          <label htmlFor="firstName">نام</label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setErrors((prev) => ({ ...prev, firstName: '' }));
            }}
            placeholder="نام"
            autoFocus
            className="wizard-input"
          />
          {errors.firstName && <span className="field-error">{errors.firstName}</span>}
        </div>

        <div className="wizard-field">
          <label htmlFor="lastName">نام خانوادگی</label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setErrors((prev) => ({ ...prev, lastName: '' }));
            }}
            placeholder="نام خانوادگی"
            className="wizard-input"
          />
          {errors.lastName && <span className="field-error">{errors.lastName}</span>}
        </div>

        <div className="wizard-actions">
          <button type="button" onClick={onBack} className="wizard-btn-secondary">
            مرحله قبل
          </button>
          <button type="submit" className="wizard-btn-primary" disabled={!firstName.trim() || !lastName.trim()}>
            مرحله بعد
          </button>
        </div>
      </form>
    </div>
  );
}
