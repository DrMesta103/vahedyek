import test from 'node:test';
import assert from 'node:assert/strict';
import { AI_PROVIDER_SEED_MODELS } from '@/app/lib/ai-provider-seed-data';
import {
  buildV2PriceItemsFromTokenPrices,
  capabilitiesFromSeedModel,
  mapModelTypeV1ToV2,
  mapProviderTypeV1ToV2,
} from '@/app/lib/ai-provider-v2-seed-helpers';

test('mapProviderTypeV1ToV2 maps the four main system providers', () => {
  assert.equal(mapProviderTypeV1ToV2('OPENAI'), 'OpenAi');
  assert.equal(mapProviderTypeV1ToV2('GEMINI'), 'GoogleGemini');
  assert.equal(mapProviderTypeV1ToV2('DEEPSEEK'), 'DeepSeek');
  assert.equal(mapProviderTypeV1ToV2('GROK'), 'Grok');
  assert.equal(mapProviderTypeV1ToV2('UNKNOWN'), null);
});

test('mapModelTypeV1ToV2 maps legacy model types', () => {
  assert.equal(mapModelTypeV1ToV2('CHAT'), 'TextGeneration');
  assert.equal(mapModelTypeV1ToV2('OCR'), 'DocumentExtraction');
  assert.equal(mapModelTypeV1ToV2('EMBEDDING'), 'Embedding');
});

test('capabilitiesFromSeedModel includes chat streaming and vision flags', () => {
  const chatModel = AI_PROVIDER_SEED_MODELS.find((model) => model.id === 'seed-model-gemini-2-flash');
  assert.ok(chatModel);

  const caps = capabilitiesFromSeedModel(chatModel!);
  assert.ok(caps.includes('TextInput'));
  assert.ok(caps.includes('TextOutput'));
  assert.ok(caps.includes('Streaming'));
  assert.ok(caps.includes('ImageInput'));
  assert.ok(caps.includes('ToolCalling'));
});

test('buildV2PriceItemsFromTokenPrices scales per-token prices to 1M token units', () => {
  const items = buildV2PriceItemsFromTokenPrices({
    inputTokenPriceUsd: 0.012,
    outputTokenPriceUsd: 0.008,
  });

  assert.equal(items.length, 2);
  assert.equal(items[0]?.usageMetricType, 'InputToken');
  assert.equal(items[0]?.unitQuantity, 1_000_000);
  assert.equal(items[0]?.priceUsd, 12_000);
  assert.equal(items[1]?.usageMetricType, 'OutputToken');
  assert.equal(items[1]?.priceUsd, 8_000);
});
