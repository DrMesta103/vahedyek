'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppendixTagPageRenderer } from '../../../../../../components/contracts/appendices/AppendixTagPageRenderer';
import { useAppendixEditor } from '../../../../../../components/contracts/appendices/AppendixEditorContext';
import { isSupportedAppendixTag } from '../../../../../../lib/appendixTagSupport';

export default function ContractAppendixTagPage() {
  const params = useParams<{ tag: string }>();
  const router = useRouter();
  const tag = String(params?.tag ?? '');
  const supportedTag = isSupportedAppendixTag(tag) ? tag : null;
  const { loading, selectedTags, buildTagHref } = useAppendixEditor();

  useEffect(() => {
    if (loading) return;
    const firstTag = selectedTags[0];
    if (!firstTag) return;
    if (!supportedTag || !selectedTags.includes(supportedTag)) {
      router.replace(buildTagHref(firstTag));
    }
  }, [buildTagHref, loading, router, selectedTags, supportedTag]);

  if (!supportedTag || !selectedTags.includes(supportedTag)) {
    return <div className="rounded-[8px] border border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-sm font-semibold text-slate-500">در حال بارگذاری بخش الحاقیه...</div>;
  }

  return <AppendixTagPageRenderer tag={supportedTag} />;
}

