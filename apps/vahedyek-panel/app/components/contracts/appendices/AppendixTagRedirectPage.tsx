'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppendixEditor } from './AppendixEditorContext';

export function AppendixTagRedirectPage() {
  const router = useRouter();
  const { loading, selectedTags, buildTagHref } = useAppendixEditor();

  useEffect(() => {
    if (loading) return;
    const firstTag = selectedTags[0];
    if (!firstTag) return;
    router.replace(buildTagHref(firstTag));
  }, [buildTagHref, loading, router, selectedTags]);

  return <div className="rounded-[8px] border border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-sm font-semibold text-slate-500">در حال انتقال به بخش الحاقیه...</div>;
}

