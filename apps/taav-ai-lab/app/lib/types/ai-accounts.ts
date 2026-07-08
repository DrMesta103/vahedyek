import type { AiProviderModelPublic } from './ai-provider-models';

export const AI_PROVIDER_TYPES = [
  'OPENAI',
  'DEEPSEEK',
  'GEMINI',
  'GROK',
  'AZURE_OPENAI',
  'OPENROUTER',
  'LOCAL_GATEWAY',
  'OTHER',
] as const;

export type AiProviderType = (typeof AI_PROVIDER_TYPES)[number];

export const AI_PROVIDER_LABELS: Record<AiProviderType, string> = {
  OPENAI: 'OpenAI',
  DEEPSEEK: 'DeepSeek',
  GEMINI: 'Google Gemini',
  GROK: 'Grok',
  AZURE_OPENAI: 'Azure OpenAI',
  OPENROUTER: 'OpenRouter',
  LOCAL_GATEWAY: 'Local Gateway',
  OTHER: 'Other',
};

export const SYSTEM_AI_PROVIDER_TYPES: AiProviderType[] = ['OPENAI', 'DEEPSEEK', 'GEMINI', 'GROK'];

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
