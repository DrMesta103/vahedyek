import React from 'react';

interface FieldLabelProps {
  label: string;
  required?: boolean;
}

export const FieldLabel: React.FC<FieldLabelProps> = ({ label, required }) => {
  return (
    <label className="flex items-center gap-1 text-[13px] font-medium text-slate-600">
      {label}
      {required ? <span className="text-rose-500">*</span> : null}
    </label>
  );
};
