'use client';

import { CircleCheck } from 'lucide-react';
import { FieldGroup, TagPills } from './ContractFormPrimitives';
import { Input } from '@repo/ui';
import { persianMoneyWords } from '../../../../lib/persianNumberWords';
import type { PricingType } from '../../../../types/contract';

function PricingInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const words = persianMoneyWords(Number(value.replace(/,/g, '')) || 0);

  return (
    <div className="w-full">
      <div className="mb-1.5 text-[13px] text-[#6b7078]">{label}</div>
      <div className="relative">
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode="numeric"
          className="h-10 rounded-lg border-[#cfd4db] bg-white/80 pr-3 pl-14 text-left text-[13px] font-semibold text-[#4e545c]"
        />
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-xs font-semibold text-[#8b9096]">تومان</span>
      </div>
      {words ? <div className="mt-1.5 text-[11px] font-bold leading-5 text-[#18a9c3]">{words}</div> : null}
    </div>
  );
}

export function FinancialPricingBox({
  pricingType,
  onPricingTypeChange,
  totalArea,
  unitArea,
  parkingArea,
  pricePerMeter,
  onPricePerMeterChange,
  parkingPricePerMeter,
  onParkingPricePerMeterChange,
  fixedTotalAmount,
  onFixedTotalAmountChange,
  meteredTotal,
  formatInput,
  formatMoney,
}: {
  pricingType: PricingType;
  onPricingTypeChange: (value: PricingType) => void;
  totalArea: string;
  unitArea: string;
  parkingArea: string;
  pricePerMeter: string;
  onPricePerMeterChange: (value: string) => void;
  parkingPricePerMeter: string;
  onParkingPricePerMeterChange: (value: string) => void;
  fixedTotalAmount: string;
  onFixedTotalAmountChange: (value: string) => void;
  meteredTotal: number;
  formatInput: (value: string) => string;
  formatMoney: (value: number) => string;
}) {
  return (
    <section className="border-b border-[#d9dde4] pb-5">
      <div className="mb-3 text-[13px] font-bold text-[#4c5259]">
        قیمت‌گذاری قرارداد
      </div>

      <div>
        <p className="mb-4 text-[13px] leading-7 text-[#666b73]">
          برای تعیین مبلغ قرارداد انتخاب کنید که مبلغ واحد به صورت مقطوع است یا بر اساس مساحت متر مربع محاسبه می‌شود.
        </p>

        <FieldGroup label="نوع قیمت‌گذاری" required>
          <TagPills
            value={pricingType}
            onChange={onPricingTypeChange}
            options={[
              { value: 'metered', label: 'قیمت فروش به صورت متری' },
              { value: 'fixed', label: 'قیمت فروش کلی' },
            ]}
          />
        </FieldGroup>

        <div className="mt-4 rounded-xl bg-[#ededed] px-3 py-3">
          {pricingType === 'metered' ? (
            <div className="space-y-3">
              <div className="grid gap-4 border-b border-[#cfd4db]/70 pb-3 lg:grid-cols-[1fr_minmax(280px,520px)] lg:items-start">
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-[13px] font-bold text-[#52575f]">
                      <CircleCheck className="h-5 w-5 text-[#59606a]" />
                      <span>هر مترمربع واحد</span>
                    </div>
                    <p className="text-[13px] leading-7 text-[#666b73]">
                      مبلغ موردنظر برای هر مترمربع از واحد را وارد کنید. این مقدار در متراژ واحد ضرب شده و مبلغ پایه قرارداد را تشکیل می‌دهد.
                    </p>
                  </div>
                  <div>
                    <PricingInput
                      label="مبلغ هر مترمربع واحد"
                      value={pricePerMeter}
                      onChange={(value) => onPricePerMeterChange(formatInput(value))}
                      placeholder="مثال: 450,000"
                    />
                    <div className="mt-2 text-sm text-[#5c6169]">متراژ واحد: {unitArea || '0'} متر مربع</div>
                  </div>
              </div>

              <div className="grid gap-4 border-b border-[#cfd4db]/70 pb-3 lg:grid-cols-[1fr_minmax(280px,520px)] lg:items-start">
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-[13px] font-bold text-[#52575f]">
                      <CircleCheck className="h-5 w-5 text-[#59606a]" />
                      <span>هر مترمربع پارکینگ</span>
                    </div>
                    <p className="text-[13px] leading-7 text-[#666b73]">
                      اگر واحد دارای پارکینگ است، قیمت هر متر پارکینگ را جداگانه وارد کنید تا در مبلغ کل محاسبه شود.
                    </p>
                  </div>
                  <div>
                    <PricingInput
                      label="مبلغ هر مترمربع پارکینگ"
                      value={parkingPricePerMeter}
                      onChange={(value) => onParkingPricePerMeterChange(formatInput(value))}
                      placeholder="مثال: 120,000"
                    />
                    <div className="mt-2 text-sm text-[#5c6169]">متراژ پارکینگ: {parkingArea || '0'} متر مربع</div>
                  </div>
              </div>

              <div className="pt-1">
                <div className="mb-1 text-[13px] text-[#6b7078]">قیمت کل محاسبه‌شده</div>
                <div className="flex min-h-10 items-center justify-between rounded-lg border border-[#aeb9c3] bg-white/60 px-3 text-[13px] font-bold text-[#4b5159]">
                  <span>متراژ کل: {totalArea || '0'} متر مربع</span>
                  <span>{formatMoney(meteredTotal)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1fr_minmax(280px,520px)] lg:items-start">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-[13px] font-bold text-[#52575f]">
                    <CircleCheck className="h-5 w-5 text-[#59606a]" />
                    <span>قیمت فروش کلی</span>
                  </div>
                  <p className="text-[13px] leading-7 text-[#666b73]">
                    مبلغ کل قرارداد را به صورت ثابت وارد کنید. در این حالت متراژ واحد و پارکینگ در محاسبه مبلغ دخالت داده نمی‌شود.
                  </p>
                </div>
                <PricingInput
                  label="مبلغ کل قرارداد"
                  value={fixedTotalAmount}
                  onChange={(value) => onFixedTotalAmountChange(formatInput(value))}
                  placeholder="مبلغ کل را وارد کنید"
                />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
