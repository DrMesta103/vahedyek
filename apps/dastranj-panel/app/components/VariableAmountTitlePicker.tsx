'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import {
  VARIABLE_TITLE_OTHER,
  getVariableTitlePresets,
  isVariableTitleOther,
  type VariableAmountType,
} from '../lib/payroll-business-settings';

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

  const selectPreset = (preset: string) => {
    setOtherMode(false);
    onTitleChange(preset);
  };

  const selectOther = () => {
    setOtherMode(true);
    if (!otherMode || presets.includes(title.trim())) {
      onTitleChange('');
    }
  };

  return (
    <div className="variable-amount-type-picker">
      <span className="variable-amount-type-picker-label">نوع مبلغ</span>
      <div className="variable-amount-type-picker-chips business-payroll-chips">
        {presets.map((preset) => {
          const selected = !otherMode && title === preset;
          return (
            <button
              key={preset}
              type="button"
              className={selected ? 'is-selected' : ''}
              onClick={() => selectPreset(preset)}
            >
              {selected ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
              {preset}
            </button>
          );
        })}
        <button type="button" className={otherMode ? 'is-selected' : ''} onClick={selectOther}>
          {otherMode ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
          {otherLabel}
        </button>
      </div>
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
