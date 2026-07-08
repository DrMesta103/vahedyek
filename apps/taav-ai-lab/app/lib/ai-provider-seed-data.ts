import { GLOBAL_SETTINGS_MOCK } from './global-settings-mock';
import { getOcrModelById } from './ocr-models';
import type { AiProviderType } from './types/ai-accounts';

export type AiProviderSeedAccount = {
  id: string;
  name: string;
  provider: AiProviderType;
  ocrModelId: string;
  apiKey: string;
  purchasedCreditUsd: number;
};

export const AI_PROVIDER_SEED_ACCOUNTS: AiProviderSeedAccount[] = [
  {
    id: 'seed-openai',
    name: 'ChatGPT Platform',
    provider: 'OPENAI',
    ocrModelId: 'gpt-4o-ocr',
    apiKey: 'sk-seed-openai-demo-key',
    purchasedCreditUsd: 100,
  },
  {
    id: 'seed-deepseek',
    name: 'DeepSeek Platform',
    provider: 'DEEPSEEK',
    ocrModelId: 'deepseek-ocr',
    apiKey: 'sk-seed-deepseek-demo-key',
    purchasedCreditUsd: 100,
  },
  {
    id: 'seed-gemini',
    name: 'Gemini Platform',
    provider: 'GEMINI',
    ocrModelId: 'gemini-2-flash',
    apiKey: 'sk-seed-gemini-demo-key',
    purchasedCreditUsd: 100,
  },
  {
    id: 'seed-grok',
    name: 'Grok Platform',
    provider: 'GROK',
    ocrModelId: 'grok-2',
    apiKey: 'sk-seed-grok-demo-key',
    purchasedCreditUsd: 100,
  },
];

function getPricingModelForOcrId(ocrModelId: string) {
  return GLOBAL_SETTINGS_MOCK.models.find((model) => model.id === ocrModelId) ?? null;
}

export function buildSeedTokenPrices(ocrModelId: string) {
  const ocrModel = getOcrModelById(ocrModelId);
  const pricingModel = getPricingModelForOcrId(ocrModelId);
  const pricePerTokenUsd = (pricingModel?.pricePer100TokensUsd ?? 1) / 100;
  const inputRatio = ocrModel?.inputRatio ?? 0.6;

  return {
    inputTokenPriceUsd: pricePerTokenUsd * inputRatio,
    outputTokenPriceUsd: pricePerTokenUsd * (1 - inputRatio),
  };
}
