'use client';

import { AppendixFinancialPayloadEditor } from './AppendixFinancialPayloadEditor';
import type { AppendixAdjustmentPayload } from '../../../types/contract';
import type { SupportedAppendixPayload } from '../../../lib/appendixPayloads';

export function AppendixAdjustmentEditor({
  value,
  onChange,
}: {
  value: AppendixAdjustmentPayload;
  onChange: (value: SupportedAppendixPayload) => void;
}) {
  return <AppendixFinancialPayloadEditor mode="adjustment" value={value} onChange={onChange} />;
}
