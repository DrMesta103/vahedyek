'use client';

import { useEffect, useMemo, useState } from 'react';
import { TaavChoiceChipGroup } from '@repo/ui/taav/forms';
import {
  VARIABLE_TITLE_OTHER,
  getVariableTitlePresets,
  isVariableTitleOther,
  type VariableAmountType,
} from '../lib/payroll-business-settings';

const OTHER_VALUE = '__variable_title_other__';

type Props = {
  type: VariableAmountType;
  title: string;
  onTitleChange: (title: string) => void;
  customFieldLabel?: string;
};

export function VariableAmountTitlePicker({
  type,
  title,
  onTitleChange,
  customFieldLabel = 'عنوان',
}: Props) {
  const presets = getVariableTitlePresets(type);
  const otherLabel = VARIABLE_TITLE_OTHER[type];
  const [otherMode, setOtherMode] = useState(() => isVariableTitleOther(type, title));

  useEffect(() => {
    setOtherMode(isVariableTitleOther(type, title));
  }, [type, title]);

  const options = useMemo(
    () => [
      ...presets.map((preset) => ({ value: preset, label: preset })),
      { value: OTHER_VALUE, label: otherLabel },
    ],
    [otherLabel, presets],
  );

  const chipValue = otherMode ? OTHER_VALUE : presets.includes(title.trim()) ? title : OTHER_VALUE;

  const handleValueChange = (next: string | string[]) => {
    const value = Array.isArray(next) ? next[0] ?? '' : next;
    if (value === OTHER_VALUE) {
      setOtherMode(true);
      if (!otherMode || presets.includes(title.trim())) {
        onTitleChange('');
      }
      return;
    }

    setOtherMode(false);
    onTitleChange(value);
  };

  return (
    <div className="variable-amount-type-picker">
      <TaavChoiceChipGroup
        label="نوع مبلغ"
        options={options}
        value={chipValue}
        onValueChange={handleValueChange}
      />
      {otherMode ? (
        <label className="business-payroll-field variable-amount-type-picker-custom">
          <span className="business-payroll-field-label">{customFieldLabel}</span>
          <span className="business-payroll-input">
            <input
              type="text"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="عنوان را وارد کنید"
              autoFocus
            />
          </span>
        </label>
      ) : null}
    </div>
  );
}
