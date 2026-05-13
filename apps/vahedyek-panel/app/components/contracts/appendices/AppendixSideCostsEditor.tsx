'use client';

import { AppendixFinancialPayloadEditor } from './AppendixFinancialPayloadEditor';
import type { AppendixSideCostsPayload } from '../../../types/contract';
import type { SupportedAppendixPayload } from '../../../lib/appendixPayloads';

export function AppendixSideCostsEditor({
  value,
  onChange,
}: {
  value: AppendixSideCostsPayload;
  onChange: (value: SupportedAppendixPayload) => void;
}) {
  return <AppendixFinancialPayloadEditor mode="side-costs" value={value} onChange={onChange} />;
}
