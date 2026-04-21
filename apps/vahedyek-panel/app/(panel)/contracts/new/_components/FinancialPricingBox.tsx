'use client';

import { ChoiceCard } from './ChoiceCard';
import { FieldLabel } from './FieldLabel';
import { FormBox } from './FormBox';
import { Input } from '../../../../components/ui/input';
import type { PricingType } from '../../../../types/contract';

export function FinancialPricingBox({
  pricingType,
  onPricingTypeChange,
  totalArea,
  onTotalAreaChange,
  pricePerMeter,
  onPricePerMeterChange,
  fixedTotalAmount,
  onFixedTotalAmountChange,
  meteredTotal,
  formatInput,
  formatMoney,
}: {
  pricingType: PricingType;
  onPricingTypeChange: (value: PricingType) => void;
  totalArea: string;
  onTotalAreaChange: (value: string) => void;
  pricePerMeter: string;
  onPricePerMeterChange: (value: string) => void;
  fixedTotalAmount: string;
  onFixedTotalAmountChange: (value: string) => void;
  meteredTotal: number;
  formatInput: (value: string) => string;
  formatMoney: (value: number) => string;
}) {
  return (
    <FormBox title="قیمت‌گذاری قرارداد" description="نوع قیمت‌گذاری قرارداد را مشخص کنید.">
      <div className="grid gap-3 md:grid-cols-2">
        <ChoiceCard title="مقطوع" active={pricingType === 'fixed'} onClick={() => onPricingTypeChange('fixed')} />
        <ChoiceCard title="متری" active={pricingType === 'metered'} onClick={() => onPricingTypeChange('metered')} />
      </div>

      {pricingType === 'metered' ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div>
            <FieldLabel label="متراژ کل" />
            <Input value={totalArea} onChange={(event) => onTotalAreaChange(formatInput(event.target.value))} placeholder="مثال: 120" className="mt-2" />
          </div>
          <div>
            <FieldLabel label="قیمت هر متر مربع" />
            <Input value={pricePerMeter} onChange={(event) => onPricePerMeterChange(formatInput(event.target.value))} placeholder="مثال: 450,000" className="mt-2" />
          </div>
          <div>
            <FieldLabel label="قیمت کل محاسبه شده" />
            <div className="mt-2 flex h-10 items-center rounded-md border border-green-300 bg-green-50 px-3.5 text-sm font-semibold text-green-700">
              {formatMoney(meteredTotal)}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 max-w-md">
          <FieldLabel label="مبلغ کل قرارداد" />
          <Input value={fixedTotalAmount} onChange={(event) => onFixedTotalAmountChange(formatInput(event.target.value))} placeholder="مبلغ کل را وارد کنید" className="mt-2" />
        </div>
      )}
    </FormBox>
  );
}
