import type { AppendixTagKey, SupportedAppendixTagKey } from '../types/contract';

export const SUPPORTED_APPENDIX_TAGS: SupportedAppendixTagKey[] = [
  'first-party',
  'second-party',
  'unit-delivery-date',
  'adjustment',
  'contract-base-costs',
  'side-costs',
];

const SUPPORTED_APPENDIX_TAG_SET = new Set<AppendixTagKey>(SUPPORTED_APPENDIX_TAGS);

export function isSupportedAppendixTag(tag: string | null | undefined): tag is SupportedAppendixTagKey {
  return Boolean(tag) && SUPPORTED_APPENDIX_TAG_SET.has(tag as AppendixTagKey);
}

export function filterSupportedAppendixTags(tags: AppendixTagKey[]) {
  return tags.filter((tag): tag is SupportedAppendixTagKey => isSupportedAppendixTag(tag));
}
