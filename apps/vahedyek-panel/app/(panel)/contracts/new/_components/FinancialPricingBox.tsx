'use client';

import { CircleCheck } from 'lucide-react';
import { FieldGroup, TagPills } from './ContractFormPrimitives';
import { Input } from '@repo/ui';
import { persianMoneyWords } from '../../../../lib/persianNumberWords';
import { getAreaPricingModeConfig, getAreaPricingModePresentation } from '../../../../lib/contractFinancialPricing';
import type { AreaPricingMode, PricingType } from '../../../../types/contract';

function parseArea(value: string) {
  return Number(value.replace(/,/g, '')) || 0;
}

function PricingInput({
  label,
  value,
  onChange,
  placeholder,
  invalid = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  invalid?: boolean;
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
          aria-invalid={invalid || undefined}
          className={`h-10 rounded-lg bg-white/80 pr-3 pl-14 text-left text-[13px] font-semibold text-[#4e545c] ${
            invalid ? 'border-rose-300 ring-4 ring-rose-500/10' : 'border-[#cfd4db]'
          }`}
        />
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-xs font-semibold text-[#8b9096]">تومان</span>
      </div>
      {words ? <div className="mt-1.5 text-[11px] font-bold leading-5 text-[#18a9c3]">{words}</div> : null}
    </div>
  );
}

type PricingRow = {
  key: string;
  title: string;
  description: string;
  inputLabel: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  invalid?: boolean;
  areaLabel?: string;
  areaValue?: string;
};

function PricingRowBlock({
  row,
  formatInput,
}: {
  row: PricingRow;
  formatInput: (value: string) => string;
}) {
  return (
    <div className="grid gap-4 border-b border-[#cfd4db]/70 pb-3 last:border-b-0 last:pb-0 lg:grid-cols-[1fr_minmax(280px,520px)] lg:items-start">
      <div>
        <div className="mb-1 flex items-center gap-2 text-[13px] font-bold text-[#52575f]">
          <CircleCheck className="h-5 w-5 text-[#59606a]" />
          <span>{row.title}</span>
        </div>
        <p className="text-[13px] leading-7 text-[#666b73]">{row.description}</p>
      </div>
      <div>
        <PricingInput
          label={row.inputLabel}
          value={row.value}
          onChange={(value) => row.onChange(formatInput(value))}
          placeholder={row.placeholder}
          invalid={row.invalid}
        />
        {row.areaLabel ? (
          <div className="mt-2 text-sm text-[#5c6169]">
            {row.areaLabel}: {row.areaValue || '0'} متر مربع
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function FinancialPricingBox({
  pricingType,
  onPricingTypeChange,
  areaPricingMode,
  totalArea,
  unitArea,
  parkingArea,
  storageArea,
  pricePerMeter,
  onPricePerMeterChange,
  parkingPricePerMeter,
  onParkingPricePerMeterChange,
  storagePricePerMeter,
  onStoragePricePerMeterChange,
  fixedTotalAmount,
  onFixedTotalAmountChange,
  parkingFixedAmount,
  onParkingFixedAmountChange,
  storageFixedAmount,
  onStorageFixedAmountChange,
  meteredTotal,
  fixedTotal,
  formatInput,
  formatMoney,
  pricingTypeInvalid = false,
  totalAreaInvalid = false,
  pricePerMeterInvalid = false,
  parkingPricePerMeterInvalid = false,
  storagePricePerMeterInvalid = false,
  fixedTotalAmountInvalid = false,
  parkingFixedAmountInvalid = false,
  storageFixedAmountInvalid = false,
}: {
  pricingType: PricingType;
  onPricingTypeChange: (value: PricingType) => void;
  areaPricingMode: AreaPricingMode;
  totalArea: string;
  unitArea: string;
  parkingArea: string;
  storageArea: string;
  pricePerMeter: string;
  onPricePerMeterChange: (value: string) => void;
  parkingPricePerMeter: string;
  onParkingPricePerMeterChange: (value: string) => void;
  storagePricePerMeter: string;
  onStoragePricePerMeterChange: (value: string) => void;
  fixedTotalAmount: string;
  onFixedTotalAmountChange: (value: string) => void;
  parkingFixedAmount: string;
  onParkingFixedAmountChange: (value: string) => void;
  storageFixedAmount: string;
  onStorageFixedAmountChange: (value: string) => void;
  meteredTotal: number;
  fixedTotal: number;
  formatInput: (value: string) => string;
  formatMoney: (value: number) => string;
  pricingTypeInvalid?: boolean;
  totalAreaInvalid?: boolean;
  pricePerMeterInvalid?: boolean;
  parkingPricePerMeterInvalid?: boolean;
  storagePricePerMeterInvalid?: boolean;
  fixedTotalAmountInvalid?: boolean;
  parkingFixedAmountInvalid?: boolean;
  storageFixedAmountInvalid?: boolean;
}) {
  const areaPricing = getAreaPricingModePresentation(areaPricingMode);
  const config = getAreaPricingModeConfig(areaPricingMode);
  const meteredRows: PricingRow[] = [];
  const fixedRows: PricingRow[] = [];
  const unitAndParkingArea = String(parseArea(unitArea) + parseArea(parkingArea));
  const unitAndStorageArea = String(parseArea(unitArea) + parseArea(storageArea));

  if (config.includeParkingInBase && config.includeStorageInBase) {
    meteredRows.push({
      key: 'base',
      title: 'هر مترمربع واحد، انباری و پارکینگ',
      description: 'در این حالت کل اجزای قابل فروش با یک نرخ متری مشترک قیمت‌گذاری می‌شوند.',
      inputLabel: 'مبلغ هر مترمربع کل زیربنای قابل فروش',
      value: pricePerMeter,
      onChange: onPricePerMeterChange,
      placeholder: 'مثال: 450,000',
      invalid: pricePerMeterInvalid,
      areaLabel: 'متراژ تجمیعی',
      areaValue: totalArea,
    });
    fixedRows.push({
      key: 'base',
      title: 'مبلغ کلی واحد، انباری و پارکینگ',
      description: 'در این حالت کل اجزای قابل فروش با یک مبلغ ثابت مشترک ثبت می‌شوند.',
      inputLabel: 'مبلغ کلی کل اجزای قابل فروش',
      value: fixedTotalAmount,
      onChange: onFixedTotalAmountChange,
      placeholder: 'مبلغ کل را وارد کنید',
      invalid: fixedTotalAmountInvalid,
    });
  } else if (config.includeParkingInBase) {
    meteredRows.push({
      key: 'base',
      title: 'هر مترمربع واحد و پارکینگ',
      description: 'واحد و پارکینگ با یک نرخ متری مشترک قیمت‌گذاری می‌شوند و انباری جداگانه قیمت می‌گیرد.',
      inputLabel: 'مبلغ هر مترمربع واحد و پارکینگ',
      value: pricePerMeter,
      onChange: onPricePerMeterChange,
      placeholder: 'مثال: 450,000',
      invalid: pricePerMeterInvalid,
      areaLabel: 'متراژ واحد و پارکینگ',
      areaValue: unitAndParkingArea,
    });
    fixedRows.push({
      key: 'base',
      title: 'مبلغ کلی واحد و پارکینگ',
      description: 'واحد و پارکینگ با یک مبلغ ثابت مشترک ثبت می‌شوند و انباری جداگانه مبلغ می‌گیرد.',
      inputLabel: 'مبلغ کلی واحد و پارکینگ',
      value: fixedTotalAmount,
      onChange: onFixedTotalAmountChange,
      placeholder: 'مبلغ واحد و پارکینگ را وارد کنید',
      invalid: fixedTotalAmountInvalid,
    });
  } else if (config.includeStorageInBase) {
    meteredRows.push({
      key: 'base',
      title: 'هر مترمربع واحد و انباری',
      description: 'واحد و انباری با یک نرخ متری مشترک قیمت‌گذاری می‌شوند و پارکینگ جداگانه قیمت می‌گیرد.',
      inputLabel: 'مبلغ هر مترمربع واحد و انباری',
      value: pricePerMeter,
      onChange: onPricePerMeterChange,
      placeholder: 'مثال: 450,000',
      invalid: pricePerMeterInvalid,
      areaLabel: 'متراژ واحد و انباری',
      areaValue: unitAndStorageArea,
    });
    fixedRows.push({
      key: 'base',
      title: 'مبلغ کلی واحد و انباری',
      description: 'واحد و انباری با یک مبلغ ثابت مشترک ثبت می‌شوند و پارکینگ جداگانه مبلغ می‌گیرد.',
      inputLabel: 'مبلغ کلی واحد و انباری',
      value: fixedTotalAmount,
      onChange: onFixedTotalAmountChange,
      placeholder: 'مبلغ واحد و انباری را وارد کنید',
      invalid: fixedTotalAmountInvalid,
    });
  } else {
    meteredRows.push({
      key: 'unit',
      title: 'هر مترمربع واحد',
      description: 'در تفکیک کامل، هر جزء نرخ متری مستقل خودش را دارد.',
      inputLabel: 'مبلغ هر مترمربع واحد',
      value: pricePerMeter,
      onChange: onPricePerMeterChange,
      placeholder: 'مثال: 450,000',
      invalid: pricePerMeterInvalid,
      areaLabel: 'متراژ واحد',
      areaValue: unitArea,
    });
    fixedRows.push({
      key: 'unit',
      title: 'مبلغ کلی واحد',
      description: 'در تفکیک کامل، مبلغ ثابت واحد جداگانه ثبت می‌شود.',
      inputLabel: 'مبلغ کلی واحد',
      value: fixedTotalAmount,
      onChange: onFixedTotalAmountChange,
      placeholder: 'مبلغ واحد را وارد کنید',
      invalid: fixedTotalAmountInvalid,
    });
  }

  if (!config.includeParkingInBase && parseArea(parkingArea) > 0) {
    meteredRows.push({
      key: 'parking',
      title: 'هر مترمربع پارکینگ',
      description: 'پارکینگ در این حالت جداگانه قیمت‌گذاری می‌شود.',
      inputLabel: 'مبلغ هر مترمربع پارکینگ',
      value: parkingPricePerMeter,
      onChange: onParkingPricePerMeterChange,
      placeholder: 'مثال: 120,000',
      invalid: parkingPricePerMeterInvalid,
      areaLabel: 'متراژ پارکینگ',
      areaValue: parkingArea,
    });
    fixedRows.push({
      key: 'parking',
      title: 'مبلغ کلی پارکینگ',
      description: 'پارکینگ در این حالت جداگانه مبلغ ثابت دریافت می‌کند.',
      inputLabel: 'مبلغ کلی پارکینگ',
      value: parkingFixedAmount,
      onChange: onParkingFixedAmountChange,
      placeholder: 'مبلغ پارکینگ را وارد کنید',
      invalid: parkingFixedAmountInvalid,
    });
  }

  if (!config.includeStorageInBase && parseArea(storageArea) > 0) {
    meteredRows.push({
      key: 'storage',
      title: 'هر مترمربع انباری',
      description: 'انباری در این حالت جداگانه قیمت‌گذاری می‌شود.',
      inputLabel: 'مبلغ هر مترمربع انباری',
      value: storagePricePerMeter,
      onChange: onStoragePricePerMeterChange,
      placeholder: 'مثال: 90,000',
      invalid: storagePricePerMeterInvalid,
      areaLabel: 'متراژ انباری',
      areaValue: storageArea,
    });
    fixedRows.push({
      key: 'storage',
      title: 'مبلغ کلی انباری',
      description: 'انباری در این حالت جداگانه مبلغ ثابت دریافت می‌کند.',
      inputLabel: 'مبلغ کلی انباری',
      value: storageFixedAmount,
      onChange: onStorageFixedAmountChange,
      placeholder: 'مبلغ انباری را وارد کنید',
      invalid: storageFixedAmountInvalid,
    });
  }

  return (
    <section className="border-b border-[#d9dde4] pb-5">
      <div className="mb-3 text-[13px] font-bold text-[#4c5259]">قیمت‌گذاری قرارداد</div>

      <div>
        <p className="mb-2 text-[13px] leading-7 text-[#666b73]">
          مبنای فروش این واحد از تنظیمات پروژه خوانده شده و فرم قیمت‌گذاری بر همان اساس تنظیم می‌شود.
        </p>
        <div className="mb-4 rounded-xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 text-[13px] text-cyan-900">
          <div className="font-bold">{areaPricing.label}</div>
          <div className="mt-1 leading-7 text-cyan-800">{areaPricing.hint}</div>
        </div>

        <FieldGroup label="نوع قیمت‌گذاری" required>
          <div className={pricingTypeInvalid ? 'rounded-xl border border-rose-300 bg-rose-50/40 p-2' : ''}>
            <TagPills
              value={pricingType}
              onChange={onPricingTypeChange}
              options={[
                { value: 'metered', label: 'قیمت فروش به صورت متری' },
                { value: 'fixed', label: 'قیمت فروش کلی' },
              ]}
            />
          </div>
        </FieldGroup>

        <div className="mt-4 rounded-xl bg-[#ededed] px-3 py-3">
          {pricingType === 'metered' ? (
            <div className="space-y-3">
              {meteredRows.map((row) => (
                <PricingRowBlock key={row.key} row={row} formatInput={formatInput} />
              ))}
              <div className="pt-1">
                <div className="mb-1 text-[13px] text-[#6b7078]">قیمت کل محاسبه‌شده</div>
                <div
                  className={`flex min-h-10 items-center justify-between rounded-lg border bg-white/60 px-3 text-[13px] font-bold text-[#4b5159] ${
                    totalAreaInvalid ? 'border-rose-300 ring-4 ring-rose-500/10' : 'border-[#aeb9c3]'
                  }`}
                >
                  <span>متراژ کل قابل فروش: {totalArea || '0'} متر مربع</span>
                  <span>{formatMoney(meteredTotal)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {fixedRows.map((row) => (
                <PricingRowBlock key={row.key} row={row} formatInput={formatInput} />
              ))}
              <div className="pt-1">
                <div className="mb-1 text-[13px] text-[#6b7078]">جمع مبلغ‌های ثابت</div>
                <div className="flex min-h-10 items-center justify-between rounded-lg border border-[#aeb9c3] bg-white/60 px-3 text-[13px] font-bold text-[#4b5159]">
                  <span>مبلغ کل قرارداد</span>
                  <span>{formatMoney(fixedTotal)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
