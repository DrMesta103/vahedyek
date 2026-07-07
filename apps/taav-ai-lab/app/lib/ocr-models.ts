import type { OcrTransportMode } from './ocr-transport';

export type OcrModelProvider = 'openai' | 'deepseek' | 'google' | 'xai';

export type OcrModelOption = {
  id: string;
  name: string;
  providerLabel: string;
  provider: OcrModelProvider;
  description: string;
  inputRatio: number;
};

export const DEFAULT_OCR_MODEL_ID = 'gpt-4o-ocr';

export const OCR_MODEL_OPTIONS: OcrModelOption[] = [
  {
    id: 'gpt-4o-ocr',
    name: 'GPT-4o OCR',
    providerLabel: 'ChatGPT',
    provider: 'openai',
    description: 'دقت بالا برای اسناد فارسی',
    inputRatio: 0.58,
  },
  {
    id: 'deepseek-ocr',
    name: 'DeepSeek-OCR',
    providerLabel: 'DeepSeek',
    provider: 'deepseek',
    description: 'سریع و اقتصادی',
    inputRatio: 0.64,
  },
  {
    id: 'gemini-2-flash',
    name: 'Gemini 2.0 Flash',
    providerLabel: 'Gemini',
    provider: 'google',
    description: 'مناسب حجم بالا',
    inputRatio: 0.6,
  },
  {
    id: 'grok-2',
    name: 'Grok-2 Vision',
    providerLabel: 'Grok',
    provider: 'xai',
    description: 'تحلیل چندوجهی تصویر',
    inputRatio: 0.62,
  },
];

const OCR_MODEL_LOOKUP = new Map(OCR_MODEL_OPTIONS.map((model) => [model.id, model]));

export function getOcrModelById(modelId: string): OcrModelOption | null {
  return OCR_MODEL_LOOKUP.get(modelId) ?? null;
}

export function isOcrModelId(value: string | null | undefined): value is string {
  return Boolean(value && OCR_MODEL_LOOKUP.has(value));
}

export function resolveOcrModel(
  modelId?: string | null,
  transportMode?: OcrTransportMode | null,
): OcrModelOption {
  if (modelId && OCR_MODEL_LOOKUP.has(modelId)) {
    return OCR_MODEL_LOOKUP.get(modelId)!;
  }

  if (transportMode === 'grpc-streaming' || transportMode === 'grpc-unary') {
    return OCR_MODEL_LOOKUP.get('deepseek-ocr') ?? OCR_MODEL_OPTIONS[0];
  }

  return OCR_MODEL_LOOKUP.get(DEFAULT_OCR_MODEL_ID) ?? OCR_MODEL_OPTIONS[0];
}

export function buildOcrAiMetaFromModel(tokensUsed: number, model: OcrModelOption) {
  const inputTokens = Math.max(1, Math.round(tokensUsed * model.inputRatio));
  const outputTokens = Math.max(1, tokensUsed - inputTokens);

  return {
    __aiModelId: model.id,
    __aiModelName: model.name,
    __aiProviderLabel: model.providerLabel,
    __inputTokens: String(inputTokens),
    __outputTokens: String(outputTokens),
  };
}
