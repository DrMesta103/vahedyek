'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clampNumericValue,
  formatDecimalInput,
  formatIntegerInput,
  formatNumericDisplay,
  isOutOfRange,
  parsePropNumericValue,
} from './numeric-input.utils';

type UseTaavNumericInputStateOptions = {
  value?: number | string;
  defaultValue?: number | string;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  decimal?: boolean;
};

export function useTaavNumericInputState({
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  decimal = false,
}: UseTaavNumericInputStateOptions) {
  const isControlled = value !== undefined;
  const formatInput = decimal ? formatDecimalInput : formatIntegerInput;

  const [internalValue, setInternalValue] = useState<number | null>(() =>
    parsePropNumericValue(defaultValue, decimal),
  );
  const [displayValue, setDisplayValue] = useState(() =>
    formatNumericDisplay(parsePropNumericValue(defaultValue, decimal), decimal),
  );
  const [isFocused, setIsFocused] = useState(false);
  const [rangeInvalid, setRangeInvalid] = useState(false);
  const onValueChangeRef = useRef(onValueChange);

  onValueChangeRef.current = onValueChange;

  const resolvedValue = isControlled ? parsePropNumericValue(value, decimal) : internalValue;

  useEffect(() => {
    if (isFocused) return;
    setDisplayValue(formatNumericDisplay(resolvedValue, decimal));
    setRangeInvalid(isOutOfRange(resolvedValue, min, max));
  }, [resolvedValue, isFocused, decimal, min, max]);

  const commitValue = useCallback(
    (nextValue: number | null, notify = true) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      setRangeInvalid(isOutOfRange(nextValue, min, max));
      if (notify) {
        onValueChangeRef.current?.(nextValue);
      }
    },
    [isControlled, min, max],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleChange = useCallback(
    (raw: string) => {
      const { display, numeric } = formatInput(raw);
      setDisplayValue(display);
      commitValue(numeric);
    },
    [commitValue, formatInput],
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);

    const parsed = parsePropNumericValue(displayValue, decimal);
    const clamped = clampNumericValue(parsed, min, max);
    const nextDisplay = formatNumericDisplay(clamped, decimal);

    setDisplayValue(nextDisplay);
    commitValue(clamped);
  }, [commitValue, decimal, displayValue, min, max]);

  return {
    displayValue,
    rangeInvalid,
    handleFocus,
    handleChange,
    handleBlur,
  };
}
