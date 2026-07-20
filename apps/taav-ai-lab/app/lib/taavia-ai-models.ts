import {
  AI_PROVIDER_MODEL_TYPE_LABELS_V2,
  AI_PROVIDER_MODEL_TYPES_V2,
  type AiProviderModelTypeV2,
} from './types/ai-provider-v2';

/** Brand assignment slots mirror admin `AiProviderModelTypeV2`. */
export const TAAVIA_BRAND_AI_MODEL_PURPOSES = AI_PROVIDER_MODEL_TYPES_V2;

export type TaaviaBrandAiModelPurpose = (typeof TAAVIA_BRAND_AI_MODEL_PURPOSES)[number];

export const TAAVIA_PURPOSE_LABELS: Record<TaaviaBrandAiModelPurpose, string> = {
  ...AI_PROVIDER_MODEL_TYPE_LABELS_V2,
};

export const TAAVIA_PURPOSE_DESCRIPTIONS: Record<TaaviaBrandAiModelPurpose, string> = {
  TEXT_GENERATION: 'مدل تولید متن برای گفت‌وگو، ابزارها و خروجی ساختاریافته.',
  EMBEDDING: 'مدل بردارسازی برای جست‌وجوی معنایی.',
  RERANKING: 'مدل رتبه‌بندی نتایج بازیابی‌شده.',
  SPEECH_TO_TEXT: 'مدل تبدیل گفتار به متن.',
  TEXT_TO_SPEECH: 'مدل تبدیل متن به گفتار.',
  IMAGE_GENERATION: 'مدل تولید تصویر.',
  DOCUMENT_EXTRACTION: 'مدل استخراج اطلاعات از سند و تصویر.',
  MODERATION: 'مدل پایش و moderation محتوا.',
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
  capabilities?: Array<string>;
};

function normalizedModelType(value: string) {
  return value.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
}

export function getPurposeCompatibility(purpose: TaaviaBrandAiModelPurpose, model: ModelForCompatibility) {
  const modelType = normalizedModelType(model.modelType);
  const compatible = modelType === purpose;
  return {
    compatible,
    preferred: compatible,
    reason: compatible
      ? `مدل با نوع ${TAAVIA_PURPOSE_LABELS[purpose]} سازگار است.`
      : `این slot فقط مدل‌های نوع ${TAAVIA_PURPOSE_LABELS[purpose]} را می‌پذیرد.`,
  };
}

export function assertValidPurpose(value: unknown): asserts value is TaaviaBrandAiModelPurpose {
  if (typeof value !== 'string' || !(TAAVIA_BRAND_AI_MODEL_PURPOSES as readonly string[]).includes(value)) {
    throw new Error('نوع مدل انتخاب‌شده معتبر نیست.');
  }
}
