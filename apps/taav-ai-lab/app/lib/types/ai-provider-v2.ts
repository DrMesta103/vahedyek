export const AI_PROVIDER_TYPES_V2 = [
  'OPENAI',
  'AZURE_OPENAI',
  'GEMINI',
  'DEEPSEEK',
  'GROK',
  'OPENROUTER',
] as const;

export type AiProviderTypeV2 = (typeof AI_PROVIDER_TYPES_V2)[number];

export const AI_PROVIDER_LABELS_V2: Record<AiProviderTypeV2, string> = {
  OPENAI: 'OpenAI',
  AZURE_OPENAI: 'Azure OpenAI',
  GEMINI: 'Google Gemini',
  DEEPSEEK: 'DeepSeek',
  GROK: 'Grok',
  OPENROUTER: 'OpenRouter',
};

export const AI_PROVIDER_ACCOUNT_TRANSACTION_TYPES_V2 = ['PURCHASE', 'MANUAL_ADJUSTMENT'] as const;
export type AiProviderAccountTransactionTypeV2 = (typeof AI_PROVIDER_ACCOUNT_TRANSACTION_TYPES_V2)[number];

export const AI_PROVIDER_MODEL_TYPES_V2 = [
  'TEXT_GENERATION',
  'EMBEDDING',
  'RERANKING',
  'SPEECH_TO_TEXT',
  'TEXT_TO_SPEECH',
  'IMAGE_GENERATION',
  'DOCUMENT_EXTRACTION',
  'MODERATION',
] as const;
export type AiProviderModelTypeV2 = (typeof AI_PROVIDER_MODEL_TYPES_V2)[number];

export const AI_PROVIDER_MODEL_CAPABILITY_TYPES_V2 = [
  'TEXT_INPUT',
  'IMAGE_INPUT',
  'AUDIO_INPUT',
  'VIDEO_INPUT',
  'FILE_INPUT',
  'TEXT_OUTPUT',
  'IMAGE_OUTPUT',
  'AUDIO_OUTPUT',
  'STREAMING',
  'TOOL_CALLING',
  'STRUCTURED_OUTPUT',
] as const;
export type AiProviderModelCapabilityTypeV2 = (typeof AI_PROVIDER_MODEL_CAPABILITY_TYPES_V2)[number];

export const AI_PROVIDER_USAGE_METRIC_TYPES_V2 = [
  'INPUT_TOKEN',
  'CACHED_INPUT_TOKEN',
  'OUTPUT_TOKEN',
  'IMAGE',
  'AUDIO',
  'VIDEO',
  'DOCUMENT_PAGE',
  'REQUEST',
  'CHARACTER',
] as const;
export type AiProviderUsageMetricTypeV2 = (typeof AI_PROVIDER_USAGE_METRIC_TYPES_V2)[number];

export const AI_PROVIDER_USAGE_METRIC_LABELS_V2: Record<AiProviderUsageMetricTypeV2, string> = {
  INPUT_TOKEN: 'توکن ورودی',
  CACHED_INPUT_TOKEN: 'توکن ورودی کش‌شده',
  OUTPUT_TOKEN: 'توکن خروجی',
  IMAGE: 'تصویر',
  AUDIO: 'صوت',
  VIDEO: 'ویدیو',
  DOCUMENT_PAGE: 'صفحه سند',
  REQUEST: 'درخواست',
  CHARACTER: 'کاراکتر',
};

export const AI_PROVIDER_USAGE_UNIT_TYPES_V2 = [
  'TOKEN',
  'ITEM',
  'SECOND',
  'MINUTE',
  'PAGE',
  'REQUEST',
  'CHARACTER',
] as const;
export type AiProviderUsageUnitTypeV2 = (typeof AI_PROVIDER_USAGE_UNIT_TYPES_V2)[number];

export const AI_PROVIDER_USAGE_UNIT_LABELS_V2: Record<AiProviderUsageUnitTypeV2, string> = {
  TOKEN: 'توکن',
  ITEM: 'مورد',
  SECOND: 'ثانیه',
  MINUTE: 'دقیقه',
  PAGE: 'صفحه',
  REQUEST: 'درخواست',
  CHARACTER: 'کاراکتر',
};

export const AI_PROVIDER_MODEL_TYPE_LABELS_V2: Record<AiProviderModelTypeV2, string> = {
  TEXT_GENERATION: 'تولید متن',
  EMBEDDING: 'امبدینگ',
  RERANKING: 'رتبه‌بندی',
  SPEECH_TO_TEXT: 'گفتار به متن',
  TEXT_TO_SPEECH: 'متن به گفتار',
  IMAGE_GENERATION: 'تولید تصویر',
  DOCUMENT_EXTRACTION: 'استخراج سند',
  MODERATION: 'پایش محتوا',
};

export const AI_PROVIDER_MODEL_CAPABILITY_LABELS_V2: Record<AiProviderModelCapabilityTypeV2, string> = {
  TEXT_INPUT: 'ورودی متن',
  IMAGE_INPUT: 'ورودی تصویر',
  AUDIO_INPUT: 'ورودی صوت',
  VIDEO_INPUT: 'ورودی ویدیو',
  FILE_INPUT: 'ورودی فایل',
  TEXT_OUTPUT: 'خروجی متن',
  IMAGE_OUTPUT: 'خروجی تصویر',
  AUDIO_OUTPUT: 'خروجی صوت',
  STREAMING: 'استریم',
  TOOL_CALLING: 'فراخوانی ابزار',
  STRUCTURED_OUTPUT: 'خروجی ساختاریافته',
};

export const AI_PROVIDER_MODEL_USAGE_STATUSES_V2 = ['SUCCEEDED', 'FAILED', 'CANCELED'] as const;
export type AiProviderModelUsageStatusV2 = (typeof AI_PROVIDER_MODEL_USAGE_STATUSES_V2)[number];

export type AiProviderAccountV2Public = {
  id: string;
  name: string;
  providerType: AiProviderTypeV2;
  providerLabel: string;
  apiKeyMasked: string;
  endpoint: string | null;
  apiVersion: string | null;
  billingEmail: string | null;
  isSystem: boolean;
  isActive: boolean;
  description: string | null;
  apiKeyUpdatedAt: string;
  apiKeyUpdatedBy: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type AiProviderAccountV2CreditSummary = {
  totalCreditUsd: number;
  purchasedCreditUsd: number;
  manualAdjustmentUsd: number;
  usedCreditUsd: number;
  remainingCreditUsd: number;
};

export type AiProviderAccountV2ListItem = AiProviderAccountV2Public & {
  credit: AiProviderAccountV2CreditSummary;
  totalModelCount: number;
  activeModelCount: number;
};

export type AiProviderAccountV2ListResponse = {
  accounts: AiProviderAccountV2ListItem[];
  summary: {
    totalAccounts: number;
    activeAccounts: number;
    totalCreditUsd: number;
    totalUsedCreditUsd: number;
    totalRemainingCreditUsd: number;
  };
};

export type CreateAiProviderAccountV2Input = {
  name: string;
  providerType: AiProviderTypeV2;
  apiKey: string;
  endpoint?: string | null;
  apiVersion?: string | null;
  billingEmail?: string | null;
  description?: string | null;
  isActive: boolean;
};

export type UpdateAiProviderAccountV2Input = {
  name?: string;
  endpoint?: string | null;
  apiVersion?: string | null;
  billingEmail?: string | null;
  description?: string | null;
  isActive?: boolean;
};

export type ChangeAiProviderAccountV2ApiKeyInput = {
  apiKey: string;
};

export type AiProviderAccountTransactionV2Public = {
  id: string;
  aiProviderAccountId: string;
  transactionType: AiProviderAccountTransactionTypeV2;
  amountUsd: number;
  amountToman: number;
  transactionAt: string;
  description: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  createdBy: string;
  createdAt: string;
};

export type CreateAiProviderAccountTransactionV2Input = {
  transactionType: AiProviderAccountTransactionTypeV2;
  amountUsd: number;
  amountToman: number;
  transactionAt: string; // ISO
  description?: string | null;
};

export type AiProviderModelV2Public = {
  id: string;
  aiProviderAccountId: string;
  name: string;
  providerModelId: string;
  modelType: AiProviderModelTypeV2;
  isSystem: boolean;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  capabilities: AiProviderModelCapabilityTypeV2[];
};

export type CreateAiProviderModelV2Input = {
  name: string;
  providerModelId: string;
  modelType: AiProviderModelTypeV2;
  isActive: boolean;
  capabilities: AiProviderModelCapabilityTypeV2[];
};

export type UpdateAiProviderModelV2Input = Partial<Omit<CreateAiProviderModelV2Input, 'capabilities'>> & {
  capabilities?: AiProviderModelCapabilityTypeV2[];
};

export type AiProviderModelPricingV2Public = {
  id: string;
  aiProviderModelId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  endedBy: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  createdBy: string;
  createdAt: string;
  priceItems: AiProviderModelPriceItemV2Public[];
};

export type AiProviderModelPriceItemV2Public = {
  id: string;
  aiProviderModelPricingId: string;
  usageMetricType: AiProviderUsageMetricTypeV2;
  usageUnitType: AiProviderUsageUnitTypeV2;
  unitQuantity: number;
  priceUsd: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedBy: string | null;
  deletedAt: string | null;
};

export type CreateAiProviderModelPricingV2Input = {
  effectiveFrom: string; // ISO UTC
  priceItems: Array<{
    usageMetricType: AiProviderUsageMetricTypeV2;
    usageUnitType: AiProviderUsageUnitTypeV2;
    unitQuantity: number;
    priceUsd: number;
  }>;
};

export type EndAiProviderModelPricingV2Input = {
  effectiveTo: string; // ISO UTC
};

