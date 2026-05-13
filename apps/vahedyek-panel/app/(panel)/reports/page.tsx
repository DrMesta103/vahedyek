'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, Building2, FileText, Users, WalletCards } from 'lucide-react';
import PanelLayout from '../../components/PanelLayout';
import { getContractsList } from '../../lib/contractDraftClient';
import type { ContractStatus } from '../../types/contract';

type ProjectReportsPayload = {
  summary?: {
    blockCount: number;
    floorCount: number;
    unitCount: number;
    parkingCount: number;
    storageCount: number;
    amenityCount: number;
    plateCount: number;
  };
};

type ContractLite = {
  id: string;
  status: ContractStatus;
  data?: {
    parties?: { partyTwo?: Array<{ name?: string }> };
    financial?: { categories?: Array<{ id?: string; capAmount?: unknown }> };
  };
};

function formatMoneyRial(value: number) {
  return `${Math.round(Number(value) || 0).toLocaleString('fa-IR')} ریال`;
}

function contractAmount(contract: ContractLite) {
  const principal = contract.data?.financial?.categories?.find((item) => item.id === 'principal');
  return Number(principal?.capAmount || 0);
}

export default function ReportsPage() {
  const [contracts, setContracts] = useState<ContractLite[]>([]);
  const [projectSummary, setProjectSummary] = useState<ProjectReportsPayload['summary'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [project, ...contractResults] = await Promise.all([
          fetch('/api/business-settings/project/reports', { cache: 'no-store' }).then(async (response) => {
            const payload = (await response.json()) as ProjectReportsPayload & { message?: string };
            if (!response.ok) throw new Error(payload.message || 'دریافت گزارش پروژه انجام نشد.');
            return payload;
          }),
          ...(['draft', 'pending_approval', 'completed'] as ContractStatus[]).map((status) => getContractsList(status)),
        ]);
        if (!mounted) return;
        setProjectSummary(project.summary ?? null);
        setContracts(contractResults.flatMap((result) => result.items as ContractLite[]));
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'دریافت گزارش‌های مدیریتی انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const completed = contracts.filter((contract) => contract.status === 'completed');
    return {
      contractsTotal: contracts.length,
      completedContracts: completed.length,
      pendingContracts: contracts.filter((contract) => contract.status === 'pending_approval').length,
      draftContracts: contracts.filter((contract) => contract.status === 'draft').length,
      buyers: new Set(contracts.flatMap((contract) => contract.data?.parties?.partyTwo?.map((buyer) => buyer.name || '') ?? []).filter(Boolean)).size,
      completedAmount: completed.reduce((sum, contract) => sum + contractAmount(contract), 0),
    };
  }, [contracts]);

  return (
    <PanelLayout>
      <main className="space-y-5" dir="rtl">
        <section className="rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--surface-overlay)] p-5 shadow-[0_18px_45px_var(--shadow-soft)]">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_85%,black)]">
              <BarChart3 className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black text-[color:var(--text-strong)]">گزارش‌های مدیریتی</h1>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">خلاصه وضعیت کسب و کار بر اساس قراردادها، مشتریان و اطلاعات مجتمع ثبت‌شده.</p>
            </div>
          </div>
        </section>

        {loading ? (
          <section className="rounded-[24px] border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500">در حال بارگذاری...</section>
        ) : error ? (
          <section className="rounded-[24px] border border-rose-200 bg-rose-50 p-10 text-center text-sm font-bold text-rose-700">{error}</section>
        ) : (
          <>
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <ReportCard icon={FileText} title="کل قراردادها" value={stats.contractsTotal.toLocaleString('fa-IR')} helper={`${stats.completedContracts.toLocaleString('fa-IR')} تکمیل شده`} />
              <ReportCard icon={WalletCards} title="ارزش قراردادهای تکمیل‌شده" value={formatMoneyRial(stats.completedAmount)} helper="بر اساس مبلغ اصل قرارداد" />
              <ReportCard icon={Users} title="مشتریان قراردادها" value={stats.buyers.toLocaleString('fa-IR')} helper="نام‌های یکتا در طرف خریدار" />
              <ReportCard icon={Building2} title="واحدهای قابل پیگیری" value={(projectSummary?.unitCount ?? 0).toLocaleString('fa-IR')} helper={`${(projectSummary?.parkingCount ?? 0).toLocaleString('fa-IR')} پارکینگ، ${(projectSummary?.storageCount ?? 0).toLocaleString('fa-IR')} انباری`} />
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-900">وضعیت قراردادها</h2>
                <div className="mt-4 space-y-3">
                  <ProgressRow label="پیش‌نویس" value={stats.draftContracts} total={stats.contractsTotal} />
                  <ProgressRow label="در انتظار تایید" value={stats.pendingContracts} total={stats.contractsTotal} />
                  <ProgressRow label="تکمیل شده" value={stats.completedContracts} total={stats.contractsTotal} />
                </div>
                <Link href="/contracts" className="mt-5 inline-flex rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">
                  مشاهده قراردادها
                </Link>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-900">خلاصه مجتمع</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <MiniStat label="بلوک" value={projectSummary?.blockCount ?? 0} />
                  <MiniStat label="طبقه/بخش" value={projectSummary?.floorCount ?? 0} />
                  <MiniStat label="واحد" value={projectSummary?.unitCount ?? 0} />
                  <MiniStat label="فضای رفاهی" value={projectSummary?.amenityCount ?? 0} />
                </div>
                <Link href="/units" className="mt-5 inline-flex rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">
                  مشاهده فهرست واحدها
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
    </PanelLayout>
  );
}

function ReportCard({ icon: Icon, title, value, helper }: { icon: LucideIcon; title: string; value: string; helper: string }) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-[color-mix(in_srgb,var(--dark-teal)_80%,black)]" />
      <div className="mt-4 text-xs font-bold text-slate-500">{title}</div>
      <div className="mt-1 text-xl font-black text-slate-900">{value}</div>
      <div className="mt-2 text-xs font-semibold text-slate-500">{helper}</div>
    </article>
  );
}

function ProgressRow({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
        <span>{label}</span>
        <span>{value.toLocaleString('fa-IR')}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[color-mix(in_srgb,var(--dark-teal)_75%,#0f766e)]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="text-xs font-bold text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-black text-slate-900">{value.toLocaleString('fa-IR')}</div>
    </div>
  );
}
