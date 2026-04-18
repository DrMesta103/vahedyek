
import React from 'react';

interface FieldLabelProps {
  label: string;
}

export const FieldLabel: React.FC<FieldLabelProps> = ({ label }) => {
  return (
    <label className="text-sm font-medium text-gray-700">
      {label}
    </label>
  );
};
