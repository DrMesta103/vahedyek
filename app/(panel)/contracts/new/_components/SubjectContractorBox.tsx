'use client';

import { User } from 'lucide-react';
import { FieldGroup, FormTextInput, InlineSelect, SectionCard, SectionHeader, TagPills } from './ContractFormPrimitives';

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
}: {
  issuerType: IssuerType;
  onIssuerTypeChange: (value: IssuerType) => void;
  formerEmployeeName: string;
  onFormerEmployeeNameChange: (value: string) => void;
  selectedStaff: string;
  onSelectedStaffChange: (value: string) => void;
  formerEmployeeOptions: { value: string; label: string }[];
  staffOptions: { value: string; label: string }[];
}) {
  return (
    <SectionCard>
      <SectionHeader label="منعقدکننده قرارداد" description="فردی که این قرارداد را با مشتری منعقد کرده مشخص کنید" />
      <div className="space-y-4 p-5">
        <TagPills
          value={issuerType}
          onChange={onIssuerTypeChange}
          options={[
            { value: 'self', label: 'خودم' },
            { value: 'former', label: 'کارمند سابق' },
            { value: 'staff', label: 'سایر کارمندان' },
          ]}
        />

        {issuerType === 'former' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="انتخاب از لیست سابقین">
              <InlineSelect
                value={formerEmployeeName}
                onSelect={onFormerEmployeeNameChange}
                options={formerEmployeeOptions}
                placeholder="در صورت وجود انتخاب کنید"
                searchPlaceholder="جستجو..."
                emptyText="کارمند سابقی ثبت نشده"
              />
            </FieldGroup>
            <FieldGroup label="نام کامل کارمند سابق" hint="در صورت عدم وجود در لیست، دستی وارد کنید">
              <FormTextInput value={formerEmployeeName} onChange={onFormerEmployeeNameChange} placeholder="نام و نام خانوادگی" icon={User} />
            </FieldGroup>
          </div>
        ) : null}

        {issuerType === 'staff' ? (
          <FieldGroup label="انتخاب کارمند">
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
