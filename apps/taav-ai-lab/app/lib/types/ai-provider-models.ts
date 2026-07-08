export const AI_PROVIDER_MODEL_TYPES = [
  'CHAT',
  'OCR',
  'VISION',
  'EMBEDDING',
  'STRUCTURED_EXTRACTION',
  'RERANK',
  'MULTIMODAL',
  'OTHER',
] as const;

export type AiProviderModelType = (typeof AI_PROVIDER_MODEL_TYPES)[number];

export const AI_PROVIDER_MODEL_TYPE_LABELS: Record<AiProviderModelType, string> = {
  CHAT: 'چت',
  OCR: 'OCR',
  VISION: 'بینایی',
  EMBEDDING: 'امبدینگ',
  STRUCTURED_EXTRACTION: 'استخراج ساخت‌یافته',
  RERANK: 'بازچینش',
  MULTIMODAL: 'چندوجهی',
  OTHER: 'سایر',
};

export const AI_PROVIDER_PRICING_UNITS = [
  'TOKEN',
  'PAGE',
  'REQUEST',
  'IMAGE',
  'MINUTE',
  'MIXED',
] as const;

export type AiProviderPricingUnit = (typeof AI_PROVIDER_PRICING_UNITS)[number];

export const AI_PROVIDER_PRICING_UNIT_LABELS: Record<AiProviderPricingUnit, string> = {
  TOKEN: 'توکن',
  PAGE: 'صفحه',
  REQUEST: 'درخواست',
  IMAGE: 'تصویر',
  MINUTE: 'دقیقه',
  MIXED: 'ترکیبی',
};

export type AiProviderModelPublic = {
  id: string;
  accountId: string;
  displayName: string;
  providerModelName: string;
  modelType: AiProviderModelType;
  modelTypeLabel: string;
  pricingUnit: AiProviderPricingUnit;
  pricingUnitLabel: string;
  inputTokenPriceUsd: number;
  outputTokenPriceUsd: number;
  ocrInputRatio: number;
  requestPriceUsd: number;
  pagePriceUsd: number;
  imagePriceUsd: number;
  minutePriceUsd: number;
  supportsPersian: boolean;
  supportsEnglish: boolean;
  supportsVision: boolean;
  supportsPdf: boolean;
  supportsImage: boolean;
  supportsStructuredExtraction: boolean;
  supportsEmbedding: boolean;
  supportsFunctionCalling: boolean;
  maxInputTokens: number | null;
  maxOutputTokens: number | null;
  isDefaultForChat: boolean;
  isDefaultForOcr: boolean;
  isDefaultForEmbedding: boolean;
  isDefaultForVision: boolean;
  isSystem: boolean;
  isActive: boolean;
  notes: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AiProviderAccountDetail = {
  account: {
    id: string;
    name: string;
    provider: string;
    providerLabel: string;
    apiKeyMasked: string;
    purchasedCreditUsd: number;
    usedCreditUsd: number;
    remainingCreditUsd: number;
    isActive: boolean;
    isSystem: boolean;
    totalModelCount: number;
    activeModelCount: number;
  };
  models: AiProviderModelPublic[];
};

export type CreateAiProviderModelInput = {
  displayName: string;
  providerModelName: string;
  modelType: AiProviderModelType;
  pricingUnit: AiProviderPricingUnit;
  inputTokenPriceUsd?: number;
  outputTokenPriceUsd?: number;
  ocrInputRatio?: number;
  requestPriceUsd?: number;
  pagePriceUsd?: number;
  imagePriceUsd?: number;
  minutePriceUsd?: number;
  supportsPersian?: boolean;
  supportsEnglish?: boolean;
  supportsVision?: boolean;
  supportsPdf?: boolean;
  supportsImage?: boolean;
  supportsStructuredExtraction?: boolean;
  supportsEmbedding?: boolean;
  supportsFunctionCalling?: boolean;
  maxInputTokens?: number | null;
  maxOutputTokens?: number | null;
  isDefaultForChat?: boolean;
  isDefaultForOcr?: boolean;
  isDefaultForEmbedding?: boolean;
  isDefaultForVision?: boolean;
  isActive?: boolean;
  notes?: string | null;
  createdByUserId?: string | null;
};

export type UpdateAiProviderModelInput = Partial<CreateAiProviderModelInput>;
