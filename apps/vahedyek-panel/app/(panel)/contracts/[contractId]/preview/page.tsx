'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, FileText, ShieldAlert } from 'lucide-react';
import { getContractDetails } from '../../../../lib/contractDraftClient';

function formatNumberFa(value: number) {
  return new Intl.NumberFormat('fa-IR').format(value);
}

function formatMoneyTomanFromRial(valueRial: number) {
  if (!valueRial) return '—';
  const toman = Math.round(valueRial / 10);
  return `${formatNumberFa(toman)} تومان`;
}

function getUnitUsageLabel(usage: string | null | undefined) {
  switch (usage) {
    case 'residential':
      return 'مسکونی';
    case 'commercial':
      return 'تجاری';
    case 'office':
      return 'اداری';
    case 'parking':
      return 'پارکینگ';
    case 'storage':
      return 'انباری';
    case 'amenity':
      return 'مشاعات';
    default:
      return '';
  }
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
            {icon ?? <FileText className="h-4 w-4" />}
          </span>
          <h2 className="text-[15px] font-extrabold text-slate-900">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function LabeledValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-end text-right">
      <div className="text-[12px] font-semibold text-slate-500">{label}</div>
      <div className="mt-1 truncate text-[14px] font-extrabold text-slate-800">{value}</div>
    </div>
  );
}

export default function ContractDraftPreviewPage() {
  const params = useParams<{ contractId: string }>();
  const router = useRouter();
  const contractId = params?.contractId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contract, setContract] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!contractId) return;
      try {
        setLoading(true);
        const data = await getContractDetails(String(contractId));
        if (mounted) setContract(data);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'دریافت پیش‌نویس انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [contractId]);

  const view = useMemo(() => {
    const subject = contract?.data?.subject ?? null;
    const parties = contract?.data?.parties ?? null;
    const financial = contract?.data?.financial ?? null;
    const penalties = contract?.data?.penalties ?? null;
    const terminationRules = contract?.data?.terminationRules ?? null;
    const extraCosts = contract?.data?.extraCosts ?? null;
    const technicalSpecs = contract?.data?.technicalSpecs ?? null;
    const attachments = contract?.data?.attachments ?? null;

    const partyOne = Array.isArray(parties?.partyOne) ? parties.partyOne : [];
    const partyTwo = Array.isArray(parties?.partyTwo) ? parties.partyTwo : [];

    const parkingArea = Number(financial?.parkingArea || 0);
    const unitArea = Number(financial?.unitArea || Math.max(Number(financial?.totalArea || 0) - parkingArea, 0));
    const amountRial =
      financial?.pricingType === 'metered'
        ? unitArea * Number(financial?.pricePerMeter || 0) + parkingArea * Number(financial?.parkingPricePerMeter || 0)
        : Number(financial?.fixedTotalAmount || 0);

    const unitName = subject?.unitName ?? '—';
    const usageLabel = getUnitUsageLabel(subject?.unitUsage ?? null);
    const unitLabel = usageLabel ? `${unitName} (${usageLabel})` : unitName;

    return {
      subject,
      parties,
      partyOne,
      partyTwo,
      financial,
      penalties,
      terminationRules,
      extraCosts,
      technicalSpecs,
      attachments,
      amountRial,
      unitLabel,
    };
  }, [contract]);

  if (loading) {
    return (
      <main dir="rtl" className="mx-auto w-[min(1180px,calc(100%-30px))] py-4">
        <div className="rounded-[22px] border border-slate-200/80 bg-white/90 p-5 text-sm font-bold text-slate-600 shadow-sm">
          در حال بارگذاری…
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main dir="rtl" className="mx-auto w-[min(1180px,calc(100%-30px))] py-4">
        <div className="rounded-[22px] border border-rose-200 bg-rose-50 p-5 text-sm font-bold text-rose-700 shadow-sm">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="mx-auto w-[min(1180px,calc(100%-30px))] py-4">
      <header className="mb-4 rounded-[22px] border border-slate-200/80 bg-white/90 p-4 shadow-sm">
        <div className="flex flex-row-reverse items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-slate-500">مشاهده پیش‌نویس قرارداد</div>
            <div className="mt-1 truncate text-[18px] font-extrabold text-slate-900">
              {view.subject?.contractNumber ? `شماره قرارداد ${view.subject.contractNumber}` : '—'}
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/contracts/${String(contractId)}`)}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[13px] font-bold text-slate-700 transition-colors hover:bg-slate-100"
          >
            بازگشت
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="grid gap-4">
        <Section title="اطلاعات پایه">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <LabeledValue label="واحد" value={view.unitLabel || '—'} />
            <LabeledValue label="طبقه" value={view.subject?.floorName ?? '—'} />
            <LabeledValue label="بلوک" value={view.subject?.blockName ?? '—'} />
            <LabeledValue label="شماره قرارداد" value={view.subject?.contractNumber ?? '—'} />
            <LabeledValue label="تاریخ قرارداد" value={view.subject?.contractDate ?? '—'} />
            <LabeledValue label="مبلغ قرارداد" value={formatMoneyTomanFromRial(view.amountRial)} />
          </div>
        </Section>

        <Section title="طرفین">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-3">
              <div className="mb-2 text-[12px] font-extrabold text-slate-700">طرف اول</div>
              {view.partyOne.length ? (
                <div className="space-y-2">
                  {view.partyOne.map((p: any) => (
                    <div key={p.personId ?? p.name} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white px-3 py-2">
                      <div className="min-w-0 text-right">
                        <div className="truncate text-[13px] font-extrabold text-slate-800">{p.name ?? '—'}</div>
                        <div className="mt-0.5 text-[12px] font-semibold text-slate-500">{p.personType === 'legal' ? 'حقوقی' : 'حقیقی'}</div>
                      </div>
                      <div className="text-[12px] font-extrabold text-slate-700">
                        {p.share?.value != null ? formatNumberFa(Number(p.share.value)) : '—'} {p.share?.mode === 'percent' ? '%' : 'دانگ'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm font-semibold text-slate-500">ثبت نشده</div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-3">
              <div className="mb-2 text-[12px] font-extrabold text-slate-700">طرف دوم (خریداران)</div>
              {view.partyTwo.length ? (
                <div className="space-y-2">
                  {view.partyTwo.map((p: any) => (
                    <div key={p.personId ?? p.name} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white px-3 py-2">
                      <div className="min-w-0 text-right">
                        <div className="truncate text-[13px] font-extrabold text-slate-800">
                          {p.name ?? '—'} {p.isPrimary ? <span className="mr-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700">اصلی</span> : null}
                        </div>
                        <div className="mt-0.5 text-[12px] font-semibold text-slate-500">{p.personType === 'legal' ? 'حقوقی' : 'حقیقی'}</div>
                      </div>
                      <div className="text-[12px] font-extrabold text-slate-700">
                        {p.share?.value != null ? formatNumberFa(Number(p.share.value)) : '—'} {p.share?.mode === 'percent' ? '%' : 'دانگ'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm font-semibold text-slate-500">ثبت نشده</div>
              )}
            </div>
          </div>
        </Section>

        <Section title="اطلاعات مالی">
          {view.financial ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                <div className="mb-2 text-[12px] font-extrabold text-slate-700">خلاصه</div>
                <div className="grid grid-cols-2 gap-3">
                  <LabeledValue label="نوع قیمت‌گذاری" value={view.financial.pricingType === 'metered' ? 'متری' : 'ثابت'} />
                  <LabeledValue label="مبلغ قرارداد" value={formatMoneyTomanFromRial(view.amountRial)} />
                  <LabeledValue label="زیربنا" value={view.financial.unitArea || '—'} />
                  <LabeledValue label="متراژ پارکینگ" value={view.financial.parkingArea || '—'} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                <div className="mb-2 text-[12px] font-extrabold text-slate-700">دسته‌بندی‌ها</div>
                {Array.isArray(view.financial.categories) && view.financial.categories.length ? (
                  <div className="space-y-2">
                    {view.financial.categories.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white px-3 py-2 text-[13px]">
                        <span className="font-extrabold text-slate-800">{c.name}</span>
                        <span className="font-extrabold text-slate-700">{formatMoneyTomanFromRial(Number(c.capAmount || 0))}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-slate-500">ثبت نشده</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm font-semibold text-slate-500">ثبت نشده</div>
          )}
        </Section>

        <Section title="جرایم" icon={<ShieldAlert className="h-4 w-4" />}>
          {view.penalties ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                <div className="mb-2 text-[12px] font-extrabold text-slate-700">انواع جریمه</div>
                {Array.isArray(view.penalties.types) && view.penalties.types.length ? (
                  <div className="space-y-2">
                    {view.penalties.types.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white px-3 py-2 text-[13px]">
                        <span className="font-extrabold text-slate-800">{t.title || t.id}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${t.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {t.active ? 'فعال' : 'غیرفعال'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-slate-500">ثبت نشده</div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                <div className="mb-2 text-[12px] font-extrabold text-slate-700">قواعد</div>
                {Array.isArray(view.penalties.rules) && view.penalties.rules.length ? (
                  <div className="space-y-2">
                    {view.penalties.rules.map((r: any) => (
                      <div key={r.id} className="rounded-xl border border-slate-200/70 bg-white px-3 py-2">
                        <div className="flex items-center justify-between gap-3 text-[13px]">
                          <span className="font-extrabold text-slate-800">کد: {r.id}</span>
                          <span className="font-extrabold text-slate-700">{r.mode} / {r.period}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-[12px] font-semibold text-slate-600">
                          <span>مبلغ ثابت: {r.fixedAmount || '—'}</span>
                          <span>درصد جریمه: {r.penaltyPercent || '—'}</span>
                          <span>روزهای ارفاق: {r.graceDays || '—'}</span>
                          <span>گرد کردن: {r.roundRule || '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-slate-500">ثبت نشده</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm font-semibold text-slate-500">ثبت نشده</div>
          )}
        </Section>

        <Section title="شرایط فسخ">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-3">
            <div className="mb-2 text-[12px] font-extrabold text-slate-700">قواعد ذخیره‌شده</div>
            <pre className="max-h-[320px] overflow-auto rounded-xl border border-slate-200 bg-white p-3 text-left text-[12px] leading-6 text-slate-700" dir="ltr">
              {JSON.stringify(view.terminationRules?.buyerRules ?? {}, null, 2)}
            </pre>
          </div>
        </Section>

        <Section title="سایر هزینه‌ها">
          <pre className="max-h-[320px] overflow-auto rounded-xl border border-slate-200 bg-white p-3 text-left text-[12px] leading-6 text-slate-700" dir="ltr">
            {JSON.stringify(view.extraCosts?.payload ?? [], null, 2)}
          </pre>
        </Section>

        <Section title="مشخصات فنی">
          <pre className="max-h-[320px] overflow-auto rounded-xl border border-slate-200 bg-white p-3 text-left text-[12px] leading-6 text-slate-700" dir="ltr">
            {JSON.stringify(view.technicalSpecs?.specs ?? [], null, 2)}
          </pre>
        </Section>

        <Section title="پیوست‌ها و اسناد">
          <div className="grid gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-3">
              <div className="text-[12px] font-extrabold text-slate-700">اسناد</div>
              <pre className="mt-2 max-h-[260px] overflow-auto rounded-xl border border-slate-200 bg-white p-3 text-left text-[12px] leading-6 text-slate-700" dir="ltr">
                {JSON.stringify(view.attachments?.documents ?? [], null, 2)}
              </pre>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-3">
              <div className="text-[12px] font-extrabold text-slate-700">یادداشت</div>
              <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 text-[13px] font-semibold text-slate-700">
                {view.attachments?.notes || '—'}
              </div>
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}

