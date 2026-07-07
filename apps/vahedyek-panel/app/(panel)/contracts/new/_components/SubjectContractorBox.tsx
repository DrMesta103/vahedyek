'use client';

import { User } from 'lucide-react';
import { TagPills } from '@repo/ui';
import { FieldGroup, FormTextInput, InlineSelect, SectionCard, SectionHeader } from './ContractFormPrimitives';

export type IssuerType = 'self' | 'former' | 'staff';

export function SubjectContractorBox({
  issuerType,
  onIssuerTypeChange,
  formerEmployeeName,
  onFormerEmployeeNameChange,
  selectedStaff,
  onSelectedStaffChange,
  formerEmployeeOptions,
  staffOptions,
  formerEmployeeInvalid = false,
  selectedStaffInvalid = false,
}: {
  issuerType: IssuerType;
  onIssuerTypeChange: (value: IssuerType) => void;
  formerEmployeeName: string;
  onFormerEmployeeNameChange: (value: string) => void;
  selectedStaff: string;
  onSelectedStaffChange: (value: string) => void;
  formerEmployeeOptions: { value: string; label: string }[];
  staffOptions: { value: string; label: string }[];
  formerEmployeeInvalid?: boolean;
  selectedStaffInvalid?: boolean;
}) {
  return (
    <SectionCard>
      <SectionHeader label="مشخصات سازنده" description="مشخص کنید این قرارداد به نام چه سازنده یا نماینده‌ای ثبت می‌شود." />
      <div className="space-y-5 p-5 sm:p-6">
        <FieldGroup label="نوع سازنده" required hint="نوع شخصیت یا منبع ثبت‌کننده قرارداد را انتخاب کنید.">
          <TagPills
            options={[
              { value: 'self', label: 'خودم' },
              { value: 'former', label: 'کارمند سابق' },
              { value: 'staff', label: 'کارمند سازمان' },
            ]}
            value={issuerType}
            onChange={onIssuerTypeChange}
            wrap={false}
            className="justify-start overflow-x-auto pb-1"
          />
        </FieldGroup>

        {issuerType === 'former' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="انتخاب از لیست سابقه">
              <InlineSelect
                value={formerEmployeeName}
                onSelect={onFormerEmployeeNameChange}
                options={formerEmployeeOptions}
                placeholder="یک نام از سابقه انتخاب کنید"
                searchPlaceholder="جستجو..."
                emptyText="سابقه‌ای پیدا نشد"
              />
            </FieldGroup>
            <FieldGroup label="نام سازنده سابق" hint="در صورت نیاز نام را به‌صورت دستی اصلاح کنید">
              <FormTextInput value={formerEmployeeName} onChange={onFormerEmployeeNameChange} placeholder="نام و نام خانوادگی" icon={User} />
            </FieldGroup>
          </div>
        ) : null}

        {issuerType === 'staff' ? (
          <FieldGroup label="کارمند سازنده">
            <InlineSelect
              value={selectedStaff}
              onSelect={onSelectedStaffChange}
              options={staffOptions}
              placeholder="یک کارمند را انتخاب کنید"
              searchPlaceholder="جستجو در کارمندان..."
              emptyText="کارمندی پیدا نشد"
            />
          </FieldGroup>
        ) : null}
      </div>
    </SectionCard>
  );
}
