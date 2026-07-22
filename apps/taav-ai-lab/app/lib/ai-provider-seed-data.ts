import { GLOBAL_SETTINGS_MOCK } from './global-settings-mock';
import { getOcrModelById } from './ocr-models';
import type { AiProviderType } from './types/ai-accounts';
import type { AiProviderModelType, AiProviderPricingUnit } from './types/ai-provider-models';

export type AiProviderSeedAccount = {
  id: string;
  name: string;
  provider: AiProviderType;
  apiKey: string;
  purchasedCreditUsd: number;
};

export type AiProviderSeedModel = {
  id: string;
  provider: AiProviderType;
  pricingModelId: string;
  displayName: string;
  providerModelName: string;
  modelType: AiProviderModelType;
  pricingUnit?: AiProviderPricingUnit;
  pagePriceUsd?: number;
  inputRatio?: number;
  supportsPersian?: boolean;
  supportsEnglish?: boolean;
  supportsVision?: boolean;
  supportsPdf?: boolean;
  supportsImage?: boolean;
  supportsStructuredExtraction?: boolean;
  supportsEmbedding?: boolean;
  supportsFunctionCalling?: boolean;
  isDefaultForChat?: boolean;
  isDefaultForOcr?: boolean;
  isDefaultForEmbedding?: boolean;
  isDefaultForVision?: boolean;
};

export const AI_PROVIDER_SEED_ACCOUNTS: AiProviderSeedAccount[] = [
  {
    id: 'seed-openai',
    name: 'ChatGPT Platform',
    provider: 'OPENAI',
    apiKey: 'sk-seed-openai-demo-key',
    purchasedCreditUsd: 100,
  },
  {
    id: 'seed-deepseek',
    name: 'DeepSeek Platform',
    provider: 'DEEPSEEK',
    apiKey: 'sk-seed-deepseek-demo-key',
    purchasedCreditUsd: 100,
  },
  {
    id: 'seed-gemini',
    name: 'Gemini Platform',
    provider: 'GEMINI',
    apiKey: 'sk-seed-gemini-demo-key',
    purchasedCreditUsd: 100,
  },
  {
    id: 'seed-grok',
    name: 'Grok Platform',
    provider: 'GROK',
    apiKey: 'sk-seed-grok-demo-key',
    purchasedCreditUsd: 100,
  },
  {
    id: 'seed-mistral',
    name: 'Mistral Platform',
    provider: 'MISTRAL',
    apiKey: 'sk-seed-mistral-demo-key',
    purchasedCreditUsd: 100,
  },
];

export const AI_PROVIDER_SEED_MODELS: AiProviderSeedModel[] = [
  {
    id: 'seed-model-gpt-4-5',
    provider: 'OPENAI',
    pricingModelId: 'gpt-4-5',
    displayName: 'GPT-4.5',
    providerModelName: 'gpt-4-5',
    modelType: 'CHAT',
    supportsPersian: true,
    supportsEnglish: true,
    supportsFunctionCalling: true,
    isDefaultForChat: true,
  },
  {
    id: 'seed-model-text-embedding-3-large',
    provider: 'OPENAI',
    pricingModelId: 'text-embedding-3-large',
    displayName: 'text-embedding-3-large',
    providerModelName: 'text-embedding-3-large',
    modelType: 'EMBEDDING',
    supportsEmbedding: true,
    isDefaultForEmbedding: true,
  },
  {
    id: 'seed-model-gpt-4o-ocr',
    provider: 'OPENAI',
    pricingModelId: 'gpt-4o-ocr',
    displayName: 'GPT-4o OCR',
    providerModelName: 'gpt-4o-ocr',
    modelType: 'OCR',
    inputRatio: 0.58,
    supportsPersian: true,
    supportsEnglish: true,
    supportsVision: true,
    supportsPdf: true,
    supportsImage: true,
    supportsStructuredExtraction: true,
    isDefaultForOcr: true,
  },
  {
    id: 'seed-model-gemini-2-flash',
    provider: 'GEMINI',
    pricingModelId: 'gemini-2-flash',
    displayName: 'Gemini 2.0 Flash',
    providerModelName: 'gemini-2-flash',
    modelType: 'CHAT',
    inputRatio: 0.6,
    supportsPersian: true,
    supportsEnglish: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    isDefaultForChat: true,
    isDefaultForVision: true,
  },
  {
    id: 'seed-model-text-embedding-004',
    provider: 'GEMINI',
    pricingModelId: 'text-embedding-004',
    displayName: 'text-embedding-004',
    providerModelName: 'text-embedding-004',
    modelType: 'EMBEDDING',
    supportsEmbedding: true,
    isDefaultForEmbedding: true,
  },
  {
    id: 'seed-model-grok-2',
    provider: 'GROK',
    pricingModelId: 'grok-2',
    displayName: 'Grok-2 Vision',
    providerModelName: 'grok-2',
    modelType: 'CHAT',
    inputRatio: 0.62,
    supportsPersian: true,
    supportsEnglish: true,
    supportsVision: true,
    supportsImage: true,
    isDefaultForChat: true,
    isDefaultForVision: true,
  },
  {
    id: 'seed-model-deepseek-v3',
    provider: 'DEEPSEEK',
    pricingModelId: 'deepseek-v3',
    displayName: 'DeepSeek-V3',
    providerModelName: 'deepseek-v3',
    modelType: 'CHAT',
    supportsPersian: true,
    supportsEnglish: true,
    supportsFunctionCalling: true,
    isDefaultForChat: true,
  },
  {
    id: 'seed-model-deepseek-ocr',
    provider: 'DEEPSEEK',
    pricingModelId: 'deepseek-ocr',
    displayName: 'DeepSeek-OCR',
    providerModelName: 'deepseek-ocr',
    modelType: 'OCR',
    inputRatio: 0.64,
    supportsPersian: true,
    supportsEnglish: true,
    supportsVision: true,
    supportsPdf: true,
    supportsImage: true,
    supportsStructuredExtraction: true,
    isDefaultForOcr: true,
  },
  {
    id: 'seed-model-mistral-ocr',
    provider: 'MISTRAL',
    pricingModelId: 'mistral-ocr-latest',
    displayName: 'Mistral OCR',
    providerModelName: 'mistral-ocr-latest',
    modelType: 'OCR',
    pricingUnit: 'PAGE',
    // Official API: $4 / 1,000 pages => $0.004 per page
    pagePriceUsd: 0.004,
    supportsPersian: true,
    supportsEnglish: true,
    supportsVision: true,
    supportsPdf: true,
    supportsImage: true,
    supportsStructuredExtraction: true,
    isDefaultForOcr: true,
  },
];

const DEFAULT_INPUT_RATIO_BY_TYPE: Partial<Record<AiProviderModelType, number>> = {
  CHAT: 0.6,
  EMBEDDING: 0.6,
  OCR: 0.6,
};

function getPricingModelById(pricingModelId: string) {
  return GLOBAL_SETTINGS_MOCK.models.find((model) => model.id === pricingModelId) ?? null;
}

export function buildModelSeedPrices(input: {
  pricingModelId: string;
  modelType: AiProviderModelType;
  inputRatio?: number;
  pricingUnit?: AiProviderPricingUnit;
  pagePriceUsd?: number;
}) {
  if (input.pricingUnit === 'PAGE') {
    return {
      inputTokenPriceUsd: 0,
      outputTokenPriceUsd: 0,
      pagePriceUsd: input.pagePriceUsd ?? 0,
      pricingUnit: 'PAGE' as const,
    };
  }

  const pricingModel = getPricingModelById(input.pricingModelId);
  const ocrModel = getOcrModelById(input.pricingModelId);
  const pricePerTokenUsd = (pricingModel?.pricePer100TokensUsd ?? 1) / 100;
  const inputRatio =
    input.inputRatio ?? ocrModel?.inputRatio ?? DEFAULT_INPUT_RATIO_BY_TYPE[input.modelType] ?? 0.6;

  return {
    inputTokenPriceUsd: pricePerTokenUsd * inputRatio,
    outputTokenPriceUsd: pricePerTokenUsd * (1 - inputRatio),
    pagePriceUsd: input.pagePriceUsd ?? 0,
    pricingUnit: (input.pricingUnit ?? 'TOKEN') as AiProviderPricingUnit,
  };
}

export function getSeedModelsForProvider(provider: AiProviderType) {
  return AI_PROVIDER_SEED_MODELS.filter((model) => model.provider === provider);
}

/** @deprecated Use buildModelSeedPrices instead — account-level token pricing removed */
export function buildSeedTokenPrices(ocrModelId: string) {
  return buildModelSeedPrices({
    pricingModelId: ocrModelId,
    modelType: 'OCR',
  });
}
