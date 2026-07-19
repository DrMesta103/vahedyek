import type { AiProviderSeedModel } from './ai-provider-seed-data';
import type { AiProviderType } from './types/ai-accounts';
import type { AiProviderModelType } from './types/ai-provider-models';

export type V2SeedProviderType =
  | 'OpenAi'
  | 'AzureOpenAi'
  | 'GoogleGemini'
  | 'DeepSeek'
  | 'Grok'
  | 'OpenRouter';

export type V2SeedModelType =
  | 'TextGeneration'
  | 'Embedding'
  | 'Reranking'
  | 'SpeechToText'
  | 'TextToSpeech'
  | 'ImageGeneration'
  | 'DocumentExtraction'
  | 'Moderation';

export type V2SeedCapabilityType =
  | 'TextInput'
  | 'ImageInput'
  | 'AudioInput'
  | 'VideoInput'
  | 'FileInput'
  | 'TextOutput'
  | 'ImageOutput'
  | 'AudioOutput'
  | 'Streaming'
  | 'ToolCalling'
  | 'StructuredOutput';

export type V2SeedUsageMetricType =
  | 'InputToken'
  | 'CachedInputToken'
  | 'OutputToken'
  | 'Image'
  | 'Audio'
  | 'Video'
  | 'DocumentPage'
  | 'Request'
  | 'Character';

export type V2SeedUsageUnitType =
  | 'Token'
  | 'Item'
  | 'Second'
  | 'Minute'
  | 'Page'
  | 'Request'
  | 'Character';

export type V2PriceItemDraft = {
  usageMetricType: V2SeedUsageMetricType;
  usageUnitType: V2SeedUsageUnitType;
  unitQuantity: number;
  priceUsd: number;
};

export type LegacyModelPriceSource = {
  inputTokenPriceUsd: number | string | { toString(): string };
  outputTokenPriceUsd: number | string | { toString(): string };
  cacheReadTokenPriceUsd?: number | string | { toString(): string } | null;
  requestPriceUsd?: number | string | { toString(): string } | null;
  pagePriceUsd?: number | string | { toString(): string } | null;
  imagePriceUsd?: number | string | { toString(): string } | null;
  minutePriceUsd?: number | string | { toString(): string } | null;
};

export type LegacyModelCapabilitySource = {
  supportsVision?: boolean | null;
  supportsImage?: boolean | null;
  supportsPdf?: boolean | null;
  supportsFunctionCalling?: boolean | null;
  supportsStructuredExtraction?: boolean | null;
};

const TOKEN_UNIT_QUANTITY = 1_000_000;

export function seedUuidN() {
  return crypto.randomUUID().replaceAll('-', '');
}

export function mapProviderTypeV1ToV2(provider: AiProviderType | string): V2SeedProviderType | null {
  const normalized = provider.trim().toUpperCase();
  if (normalized === 'OPENAI') return 'OpenAi';
  if (normalized === 'AZURE_OPENAI') return 'AzureOpenAi';
  if (normalized === 'GEMINI') return 'GoogleGemini';
  if (normalized === 'DEEPSEEK') return 'DeepSeek';
  if (normalized === 'GROK') return 'Grok';
  if (normalized === 'OPENROUTER') return 'OpenRouter';
  return null;
}

export function mapModelTypeV1ToV2(modelType: AiProviderModelType | string): V2SeedModelType {
  const normalized = modelType.trim().toUpperCase();
  if (normalized === 'CHAT') return 'TextGeneration';
  if (normalized === 'OCR') return 'DocumentExtraction';
  if (normalized === 'VISION') return 'TextGeneration';
  if (normalized === 'EMBEDDING') return 'Embedding';
  if (normalized === 'STRUCTURED_EXTRACTION') return 'DocumentExtraction';
  if (normalized === 'RERANK') return 'Reranking';
  return 'TextGeneration';
}

export function capabilitiesFromSeedModel(seedModel: AiProviderSeedModel): V2SeedCapabilityType[] {
  const caps = new Set<V2SeedCapabilityType>();

  if (seedModel.modelType === 'CHAT' || seedModel.modelType === 'OCR') {
    caps.add('TextInput');
    caps.add('TextOutput');
  }

  if (seedModel.modelType === 'CHAT') {
    caps.add('Streaming');
  }

  if (seedModel.modelType === 'EMBEDDING') {
    caps.add('TextInput');
  }

  if (seedModel.supportsVision) caps.add('ImageInput');
  if (seedModel.supportsImage) caps.add('ImageOutput');
  if (seedModel.supportsPdf) caps.add('FileInput');
  if (seedModel.supportsFunctionCalling) caps.add('ToolCalling');
  if (seedModel.supportsStructuredExtraction) caps.add('StructuredOutput');

  return Array.from(caps);
}

export function capabilitiesFromLegacyModel(model: LegacyModelCapabilitySource): V2SeedCapabilityType[] {
  const caps = new Set<V2SeedCapabilityType>(['TextInput', 'TextOutput']);

  if (model.supportsVision) caps.add('ImageInput');
  if (model.supportsImage) caps.add('ImageOutput');
  if (model.supportsPdf) caps.add('FileInput');
  if (model.supportsFunctionCalling) caps.add('ToolCalling');
  if (model.supportsStructuredExtraction) caps.add('StructuredOutput');

  return Array.from(caps);
}

function toFiniteNumber(value: number | string | { toString(): string } | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function addPriceItemIfPositive(
  items: V2PriceItemDraft[],
  params: V2PriceItemDraft,
) {
  if (!Number.isFinite(params.priceUsd) || params.priceUsd <= 0) return;
  items.push(params);
}

export function buildV2PriceItemsFromTokenPrices(input: {
  inputTokenPriceUsd: number;
  outputTokenPriceUsd: number;
}) {
  const items: V2PriceItemDraft[] = [];

  addPriceItemIfPositive(items, {
    usageMetricType: 'InputToken',
    usageUnitType: 'Token',
    unitQuantity: TOKEN_UNIT_QUANTITY,
    priceUsd: input.inputTokenPriceUsd * TOKEN_UNIT_QUANTITY,
  });
  addPriceItemIfPositive(items, {
    usageMetricType: 'OutputToken',
    usageUnitType: 'Token',
    unitQuantity: TOKEN_UNIT_QUANTITY,
    priceUsd: input.outputTokenPriceUsd * TOKEN_UNIT_QUANTITY,
  });

  return items;
}

export function buildV2PriceItemsFromLegacyModel(model: LegacyModelPriceSource) {
  const items: V2PriceItemDraft[] = [];

  addPriceItemIfPositive(items, {
    usageMetricType: 'InputToken',
    usageUnitType: 'Token',
    unitQuantity: TOKEN_UNIT_QUANTITY,
    priceUsd: toFiniteNumber(model.inputTokenPriceUsd) * TOKEN_UNIT_QUANTITY,
  });
  addPriceItemIfPositive(items, {
    usageMetricType: 'OutputToken',
    usageUnitType: 'Token',
    unitQuantity: TOKEN_UNIT_QUANTITY,
    priceUsd: toFiniteNumber(model.outputTokenPriceUsd) * TOKEN_UNIT_QUANTITY,
  });
  addPriceItemIfPositive(items, {
    usageMetricType: 'CachedInputToken',
    usageUnitType: 'Token',
    unitQuantity: TOKEN_UNIT_QUANTITY,
    priceUsd: toFiniteNumber(model.cacheReadTokenPriceUsd) * TOKEN_UNIT_QUANTITY,
  });
  addPriceItemIfPositive(items, {
    usageMetricType: 'Request',
    usageUnitType: 'Request',
    unitQuantity: 1,
    priceUsd: toFiniteNumber(model.requestPriceUsd),
  });
  addPriceItemIfPositive(items, {
    usageMetricType: 'DocumentPage',
    usageUnitType: 'Page',
    unitQuantity: 1,
    priceUsd: toFiniteNumber(model.pagePriceUsd),
  });
  addPriceItemIfPositive(items, {
    usageMetricType: 'Image',
    usageUnitType: 'Item',
    unitQuantity: 1,
    priceUsd: toFiniteNumber(model.imagePriceUsd),
  });
  addPriceItemIfPositive(items, {
    usageMetricType: 'Audio',
    usageUnitType: 'Minute',
    unitQuantity: 1,
    priceUsd: toFiniteNumber(model.minutePriceUsd),
  });

  return items;
}
