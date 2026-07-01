'use client';

import { CONTRACT_APPENDIX_TAG_MAP } from '../../../lib/contractAppendixConfig';
import type { AppendixTagKey } from '../../../types/contract';

export function AppendixSectionTabs({
  tags,
  activeTag,
  onChange,
}: {
  tags: AppendixTagKey[];
  activeTag: AppendixTagKey | null;
  onChange: (tag: AppendixTagKey) => void;
}) {
  if (tags.length <= 1) return null;

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onChange(tag)}
          className={`rounded-[8px] border px-4 py-3 text-[13px] font-black transition ${
            activeTag === tag
              ? 'border-cyan-300 bg-cyan-50 text-cyan-900 shadow-[0_0_0_1px_rgba(34,211,238,0.14)]'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          {CONTRACT_APPENDIX_TAG_MAP.get(tag)?.title ?? tag}
        </button>
      ))}
    </div>
  );
}

