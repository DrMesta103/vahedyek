'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PanelLayout from '../../../../components/PanelLayout';
import { setActiveDraftId } from '../../../../lib/contractDraftClient';

export default function ContractEditRedirectPage() {
  const params = useParams<{ contractId: string }>();
  const router = useRouter();
  const contractId = params?.contractId;

  useEffect(() => {
    if (!contractId) {
      router.replace('/contracts');
      return;
    }

    setActiveDraftId(String(contractId));
    router.replace('/contracts/new');
  }, [contractId, router]);

  return (
    <PanelLayout>
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
        در حال انتقال به صفحه ویرایش پیش نویس...
      </div>
    </PanelLayout>
  );
}
