'use client';

import { outlineButtonStyle, primaryButtonStyle } from '@repo/ui';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onFinalize: () => void;
}

export default function FormNavigation({ currentStep, totalSteps, onPrev, onNext, onSaveDraft, onFinalize }: FormNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #f3f4f6', marginTop: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button type="button" onClick={onPrev} disabled={isFirstStep} style={{
          ...outlineButtonStyle,
          color: isFirstStep ? '#d1d5db' : '#4b5563', cursor: isFirstStep ? 'not-allowed' : 'pointer',
        }}>
          <i className="fa fa-chevron-right" style={{ marginLeft: '5px', fontSize: '11px' }}></i>
          قبلی
        </button>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>مرحله {currentStep} از {totalSteps}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button type="button" onClick={onSaveDraft} style={{
          ...outlineButtonStyle,
        }}>
          <i className="fa fa-save" style={{ marginLeft: '5px', fontSize: '12px' }}></i>
          ذخیره پیش‌نویس
        </button>

        {!isLastStep && (
          <button type="button" onClick={onNext} style={{
            ...primaryButtonStyle,
          }}>
            بعدی
            <i className="fa fa-chevron-left" style={{ marginRight: '5px', fontSize: '11px' }}></i>
          </button>
        )}

        {isLastStep && (
          <button type="button" onClick={onFinalize} style={{
            ...primaryButtonStyle,
            background: 'var(--primary-teal)',
            boxShadow: '0 4px 12px rgba(22,160,133,0.18)',
          }}>
            <i className="fa fa-check" style={{ marginLeft: '5px', fontSize: '12px' }}></i>
            ثبت نهایی
          </button>
        )}
      </div>
    </div>
  );
}
