import { Suspense } from 'react';
import PanelLayout from '../../../../../components/PanelLayout';
import { BusinessBankAccountFormPanel } from '../../_components/BusinessBankAccountFormPanel';

function BankAccountFormFallback() {
  return (
    <div
      className="rounded-[22px] border border-slate-200/80 bg-white/90 p-10 text-center text-sm font-bold text-slate-500 shadow-sm"
      dir="rtl"
      lang="fa"
    >
      در حال بارگذاری…
    </div>
  );
}

export default function BusinessBankAccountNewPage() {
  return (
    <PanelLayout>
      <Suspense fallback={<BankAccountFormFallback />}>
        <BusinessBankAccountFormPanel />
      </Suspense>
    </PanelLayout>
  );
}
