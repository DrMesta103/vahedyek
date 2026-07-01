'use client';

function SummaryCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[8px] border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="mt-2 text-lg font-bold text-gray-800">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
    </div>
  );
}

export function FinancialSummaryBoxes({
  capAmount,
  dueAmount,
  totalContractAmount,
  pricingHint,
  formatMoney,
}: {
  capAmount: number;
  dueAmount: number;
  totalContractAmount: number;
  pricingHint: string;
  formatMoney: (value: number) => string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <SummaryCard title="??? ???????? ????" value={formatMoney(capAmount || totalContractAmount)} />
      <SummaryCard title="??? ????????" value={formatMoney(dueAmount)} />
      <SummaryCard title="???? ?? ???????" value={formatMoney(totalContractAmount)} hint={pricingHint} />
    </div>
  );
}

