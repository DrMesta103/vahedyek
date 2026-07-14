import type { AiProviderModelCapabilityTypeV2, AiProviderModelTypeV2 } from './types/ai-provider-v2';

export const TAAVIA_BRAND_AI_MODEL_PURPOSES = [
  'ADMIN_AGENT_CHAT',
  'CUSTOMER_CHAT',
  'KNOWLEDGE_BASE_CONTENT_GENERATION',
  'OCR',
  'EMBEDDING',
  'RERANKING',
  'SPEECH_TO_TEXT',
  'TEXT_TO_SPEECH',
  'VISION_ANALYSIS',
] as const;

export type TaaviaBrandAiModelPurpose = (typeof TAAVIA_BRAND_AI_MODEL_PURPOSES)[number];

export const TAAVIA_PURPOSE_LABELS: Record<TaaviaBrandAiModelPurpose, string> = {
  ADMIN_AGENT_CHAT: 'گفت‌وگوی عامل ادمین',
  CUSTOMER_CHAT: 'گفت‌وگوی مشتری',
  KNOWLEDGE_BASE_CONTENT_GENERATION: 'تولید محتوای پایگاه دانش',
  OCR: 'استخراج اطلاعات از سند',
  EMBEDDING: 'بردارسازی',
  RERANKING: 'رتبه‌بندی نتایج',
  SPEECH_TO_TEXT: 'تبدیل گفتار به متن',
  TEXT_TO_SPEECH: 'تبدیل متن به گفتار',
  VISION_ANALYSIS: 'تحلیل تصویر',
};

export const TAAVIA_PURPOSE_DESCRIPTIONS: Record<TaaviaBrandAiModelPurpose, string> = {
  ADMIN_AGENT_CHAT: 'پاسخ‌گویی عامل راه‌انداز برند.',
  CUSTOMER_CHAT: 'پاسخ‌گویی به مکالمه‌های مشتریان.',
  KNOWLEDGE_BASE_CONTENT_GENERATION: 'ساخت و تکمیل محتوای پایگاه دانش.',
  OCR: 'خواندن داده از تصویر و فایل سند.',
  EMBEDDING: 'ساخت بردار برای جست‌وجوی معنایی.',
  RERANKING: 'بهبود ترتیب نتایج بازیابی‌شده.',
  SPEECH_TO_TEXT: 'تبدیل فایل یا جریان صوتی به متن.',
  TEXT_TO_SPEECH: 'تولید صدای طبیعی از متن.',
  VISION_ANALYSIS: 'درک محتوای بصری و تصویر.',
};

export const TAAVIA_OPERATION_CODES = {
  KNOWLEDGE_BASE_BUILD: 'knowledge-base-build',
  CUSTOMER_CHAT_RESPONSE: 'customer-chat-response',
  ADMIN_AGENT_RESPONSE: 'admin-agent-response',
  BRAND_INFO_OCR: 'brand-info-ocr',
  KNOWLEDGE_EMBEDDING: 'knowledge-embedding',
  KNOWLEDGE_RERANKING: 'knowledge-reranking',
  BRAND_INFO_SPEECH_TO_TEXT: 'brand-info-speech-to-text',
  BRAND_INFO_VISION_ANALYSIS: 'brand-info-vision-analysis',
} as const;

export const TAAVIA_RESOURCE_TYPES = {
  KNOWLEDGE_BUILD: 'knowledge-build',
  CONVERSATION_MESSAGE: 'conversation-message',
  BRAND_INFO: 'brand-info',
  DOCUMENT: 'document',
  KNOWLEDGE_NODE: 'knowledge-node',
} as const;

type ModelForCompatibility = {
  modelType: AiProviderModelTypeV2 | string;
  capabilities: Array<AiProviderModelCapabilityTypeV2 | string>;
};

function normalizedModelType(value: string) {
  return value.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
}

function normalizedCapability(value: string) {
  return value.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
}

const has = (model: ModelForCompatibility, capability: AiProviderModelCapabilityTypeV2) => model.capabilities.some((item) => normalizedCapability(item) === capability);

export function getPurposeCompatibility(purpose: TaaviaBrandAiModelPurpose, model: ModelForCompatibility) {
  const modelType = normalizedModelType(model.modelType);
  if (purpose === 'EMBEDDING') return { compatible: modelType === 'EMBEDDING', preferred: true, reason: 'این purpose به مدل Embedding نیاز دارد.' };
  if (purpose === 'RERANKING') return { compatible: modelType === 'RERANKING', preferred: true, reason: 'این purpose به مدل Reranking نیاز دارد.' };
  if (purpose === 'SPEECH_TO_TEXT') return { compatible: modelType === 'SPEECH_TO_TEXT' && has(model, 'AUDIO_INPUT') && has(model, 'TEXT_OUTPUT'), preferred: true, reason: 'مدل باید ورودی صوت و خروجی متن داشته باشد.' };
  if (purpose === 'TEXT_TO_SPEECH') return { compatible: modelType === 'TEXT_TO_SPEECH' && has(model, 'TEXT_INPUT') && has(model, 'AUDIO_OUTPUT'), preferred: true, reason: 'مدل باید ورودی متن و خروجی صوت داشته باشد.' };
  if (purpose === 'OCR') {
    const preferred = modelType === 'DOCUMENT_EXTRACTION';
    const compatible = preferred || ((modelType === 'TEXT_GENERATION' || modelType === 'DOCUMENT_EXTRACTION') && (has(model, 'IMAGE_INPUT') || has(model, 'FILE_INPUT')) && has(model, 'TEXT_OUTPUT'));
    return { compatible, preferred, reason: 'برای OCR، مدل استخراج سند یا مدل دارای ورودی تصویر/فایل و خروجی متن لازم است.' };
  }
  if (purpose === 'VISION_ANALYSIS') {
    const compatible = has(model, 'IMAGE_INPUT') && has(model, 'TEXT_OUTPUT');
    return { compatible, preferred: compatible && modelType === 'TEXT_GENERATION', reason: 'مدل باید ورودی تصویر و خروجی متن داشته باشد.' };
  }
  const compatible = modelType === 'TEXT_GENERATION' && has(model, 'TEXT_INPUT') && has(model, 'TEXT_OUTPUT');
  return { compatible, preferred: compatible && has(model, 'STRUCTURED_OUTPUT'), reason: 'مدل باید ورودی و خروجی متن داشته باشد.' };
}

export function assertValidPurpose(value: unknown): asserts value is TaaviaBrandAiModelPurpose {
  if (typeof value !== 'string' || !(TAAVIA_BRAND_AI_MODEL_PURPOSES as readonly string[]).includes(value)) {
    throw new Error('Purpose انتخاب‌شده معتبر نیست.');
  }
}
