'use client';

import { AppendixFinancialPayloadEditor } from './AppendixFinancialPayloadEditor';
import type { AppendixContractBaseCostsPayload } from '../../../types/contract';
import type { SupportedAppendixPayload } from '../../../lib/appendixPayloads';

export function AppendixContractBaseCostsEditor({
  value,
  onChange,
}: {
  value: AppendixContractBaseCostsPayload;
  onChange: (value: SupportedAppendixPayload) => void;
}) {
  return <AppendixFinancialPayloadEditor mode="contract-base-costs" value={value} onChange={onChange} />;
}
