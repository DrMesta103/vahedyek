import { AI_PROVIDER_TYPES_V2, type AiProviderTypeV2 } from '@/app/lib/types/ai-provider-v2';

function isAiProviderTypeV2(value: string): value is AiProviderTypeV2 {
  return (AI_PROVIDER_TYPES_V2 as readonly string[]).includes(value);
}

export function parseAiProviderTypeV2(value: unknown): AiProviderTypeV2 | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return isAiProviderTypeV2(normalized) ? normalized : null;
}

