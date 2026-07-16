'use client';

import { TaavMobileNumberInputCard } from '@repo/ui/taav/business';
import { BUSINESS_MOBILE_NUMBER_INPUT_CARD_DEMO } from '@/lib/demo/business-mobile-number-input-card-demo';

type PreviewFrameProps = { children: React.ReactNode };

const { filledValue, invalidValue, ...cardProps } = BUSINESS_MOBILE_NUMBER_INPUT_CARD_DEMO;

function PreviewFrame({ children }: PreviewFrameProps) {
  return (
    <div dir="rtl" className="overflow-hidden rounded-[var(--taav-radius-xl)] border border-[color:var(--taav-border-subtle)]" style={{ backgroundColor: 'var(--taav-business-intro-card-preview-bg-light)', backgroundImage: 'var(--taav-business-intro-card-preview-pattern-light)' }}>
      <div className="flex justify-center p-5 md:p-8">{children}</div>
    </div>
  );
}

export function MobileNumberInputEmptyDemo() {
  return <PreviewFrame><TaavMobileNumberInputCard {...cardProps} /></PreviewFrame>;
}

export function MobileNumberInputFilledDemo() {
  return <PreviewFrame><TaavMobileNumberInputCard {...cardProps} defaultValue={filledValue} /></PreviewFrame>;
}

export function MobileNumberInputFocusedDemo() {
  return <PreviewFrame><TaavMobileNumberInputCard {...cardProps} autoFocus /></PreviewFrame>;
}

export function MobileNumberInputInvalidDemo() {
  return <PreviewFrame><TaavMobileNumberInputCard {...cardProps} defaultValue={invalidValue} error="شماره موبایل واردشده معتبر نیست." /></PreviewFrame>;
}

export function MobileNumberInputLoadingDemo() {
  return <PreviewFrame><TaavMobileNumberInputCard title={BUSINESS_MOBILE_NUMBER_INPUT_CARD_DEMO.title} description={BUSINESS_MOBILE_NUMBER_INPUT_CARD_DEMO.description} loading /></PreviewFrame>;
}
