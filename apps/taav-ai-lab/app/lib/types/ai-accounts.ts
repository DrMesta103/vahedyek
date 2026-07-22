import type { AiProviderModelPublic } from './ai-provider-models';

export const AI_PROVIDER_TYPES = [
  'OPENAI',
  'DEEPSEEK',
  'GEMINI',
  'GROK',
  'MISTRAL',
  'AZURE_OPENAI',
  'OPENROUTER',
  'LOCAL_GATEWAY',
  'OTHER',
] as const;

export const AI_ACCOUNT_PROVIDER_TYPES = [
  'OPENAI',
  'AZURE_OPENAI',
  'GEMINI',
  'DEEPSEEK',
  'GROK',
  'MISTRAL',
  'OPENROUTER',
] as const;

export type AiAccountProviderType = (typeof AI_ACCOUNT_PROVIDER_TYPES)[number];

export type AiProviderType = (typeof AI_PROVIDER_TYPES)[number];

export const AI_PROVIDER_LABELS: Record<AiProviderType, string> = {
  OPENAI: 'OpenAI',
  DEEPSEEK: 'DeepSeek',
  GEMINI: 'Google Gemini',
  GROK: 'Grok',
  MISTRAL: 'Mistral',
  AZURE_OPENAI: 'Azure OpenAI',
  OPENROUTER: 'OpenRouter',
  LOCAL_GATEWAY: 'Local Gateway',
  OTHER: 'Other',
};

export function isAiAccountProviderType(value: string): value is AiAccountProviderType {
  return (AI_ACCOUNT_PROVIDER_TYPES as readonly string[]).includes(value);
}

export const SYSTEM_AI_PROVIDER_TYPES: AiProviderType[] = [
  'OPENAI',
  'DEEPSEEK',
  'GEMINI',
  'GROK',
  'MISTRAL',
];

export type AiProviderAccountPublic = {
  id: string;
  name: string;
  provider: AiProviderType;
  providerLabel: string;
  apiKeyMasked: string;
  purchaseEmail: string | null;
  purchasedCreditUsd: number;
  usedCreditUsd: number;
  remainingCreditUsd: number;
  isSystem: boolean;
  isActive: boolean;
  totalModelCount: number;
  activeModelCount: number;
  models?: AiProviderModelPublic[];
  notes: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AiProviderAccountSummary = {
  totalAccounts: number;
  activeAccounts: number;
  totalPurchasedCreditUsd: number;
  totalUsedCreditUsd: number;
  totalRemainingCreditUsd: number;
};

export type CreateAiProviderAccountInput = {
  name: string;
  provider: AiProviderType;
  apiKey: string;
  purchaseEmail?: string | null;
  purchasedCreditUsd: number;
  notes?: string | null;
  isActive: boolean;
  createdByUserId?: string | null;
};

export type UpdateAiProviderAccountInput = {
  name?: string;
  provider?: AiProviderType;
  apiKey?: string;
  purchaseEmail?: string | null;
  purchasedCreditUsd?: number;
  notes?: string | null;
  isActive?: boolean;
};

export class SystemAiProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SystemAiProviderError';
  }
}

export class DuplicateAiProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateAiProviderError';
  }
}
