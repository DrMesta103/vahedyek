'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { getContractDetails } from '../../../lib/contractDraftClient';

function formatMoneyRial(value: number) {
  if (!value) return '—';
  return `${Math.round(value).toLocaleString('fa-IR')} ریال`;
}

export default function ContractDetailsPage() {
  const params = useParams<{ contractId: string }>();
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
        if (mounted) setError(e instanceof Error ? e.message : 'دریافت جزئیات قرارداد انجام نشد.');
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

    const partyTwoMembers = Array.isArray(parties?.partyTwo) ? parties.partyTwo.filter((p: any) => p?.name) : [];
    const buyer =
      parties?.partyTwo?.find((p: any) => p.isPrimary) ??
      parties?.partyTwo?.[0] ??
      parties?.partyOne?.find((p: any) => p.isPrimary) ??
      parties?.partyOne?.[0] ??
      null;

    const parkingArea = Number(financial?.parkingArea || 0);
    const unitArea = Number(financial?.unitArea || Math.max(Number(financial?.totalArea || 0) - parkingArea, 0));
    const amount =
      financial?.pricingType === 'metered'
        ? unitArea * Number(financial?.pricePerMeter || 0) + parkingArea * Number(financial?.parkingPricePerMeter || 0)
        : Number(financial?.fixedTotalAmount || 0);

    return {
      subject,
      buyerName: buyer?.name ?? '—',
      buyerNationalCode: '—',
      partyTwoMembers,
      blockName: subject?.blockName ?? '—',
      floorName: subject?.floorName ?? '—',
      unitLabel: `${subject?.unitName ?? '—'} ${subject?.unitUsage ? 'مسکونی' : ''}`.trim(),
      contractNumber: subject?.contractNumber ?? '—',
      contractDate: subject?.contractDate ?? '—',
      createdAt: contract?.updatedAt ?? '—',
      amount,
      contractTypeLabel: subject?.contractType === 'pre-sale' ? 'پیش فروش' : subject?.contractType === 'sale' ? 'فروش' : '—',
    };
  }, [contract]);

  if (loading) {
    return (
      <div className="contract-details-page">
        <div className="contract-details-panel contract-details-skeleton">در حال بارگذاری...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contract-details-page">
        <div className="contract-details-panel contract-details-error">{error}</div>
      </div>
    );
  }

  return (
    <main className="contract-details-page" dir="rtl" lang="fa">
      <section className="contract-details-panel contract-details-profile">
        <span className="contract-details-contact">
          <i className="fa-solid fa-phone" />
        </span>
        <div className="contract-details-buyer">
          <span className="contract-details-buyer-avatar">
            <i className="fa-regular fa-user" />
          </span>
          <div className="contract-details-buyer-info">
            <div className="contract-details-buyer-name">{view.buyerName}</div>
            <div className="contract-details-buyer-meta">کد ملی {view.buyerNationalCode}</div>
            {view.partyTwoMembers.length ? (
              <div className="contract-details-party-scroll" role="list" aria-label="طرف دوم">
                {view.partyTwoMembers.map((item: any) => (
                  <span key={item.personId ?? item.name} className="contract-details-party-chip" role="listitem">
                    {item.name}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="contract-details-panel contract-details-summary">
        <div className="contract-details-summary-grid">
          <div className="contract-details-summary-cell">{view.blockName}</div>
          <div className="contract-details-summary-cell">طبقه {view.floorName}</div>
          <div className="contract-details-summary-cell">{view.unitLabel || 'واحد —'}</div>
          <div className="contract-details-summary-cell">شماره قرارداد {view.contractNumber}</div>
        </div>

        <div className="contract-details-summary-meta">
          <div className="contract-details-summary-meta-item">
            <span>انعقاد قرارداد</span>
            <span className="contract-details-mini-user">
              {view.contractDate}
              <span className="contract-details-mini-avatar">
                <i className="fa-regular fa-user" />
              </span>
            </span>
          </div>
          <div className="contract-details-summary-meta-item">
            <span>{view.buyerName}</span>
            <span className="contract-details-mini-avatar">
              <i className="fa-regular fa-user" />
            </span>
          </div>
          <div className="contract-details-summary-meta-item">
            <span>ثبت در سامانه</span>
            <span className="contract-details-mini-user">
              {view.createdAt}
              <span className="contract-details-mini-avatar">
                <i className="fa-regular fa-user" />
              </span>
            </span>
          </div>
          <div className="contract-details-summary-meta-item">
            <span>{view.buyerName}</span>
            <span className="contract-details-mini-avatar">
              <i className="fa-regular fa-user" />
            </span>
          </div>
        </div>

        <div className="contract-details-summary-meta contract-details-summary-meta-wide">
          <div className="contract-details-summary-meta-item contract-details-summary-meta-wide-item">
            <span>مبلغ قرارداد {formatMoneyRial(view.amount)}</span>
            <span>{view.contractTypeLabel}</span>
          </div>
        </div>
      </section>

      <section className="contract-details-actions-grid">
        {[
          { title: 'الحاقیه و اظهارنامه', icon: 'fa-solid fa-file-signature', dim: true },
          { title: 'ساخت و چاپ قرارداد', icon: 'fa-regular fa-clock' },
          { title: 'نسخه ساخت و چاپ قرارداد', icon: 'fa-solid fa-print' },
          { title: 'گزارشات', icon: 'fa-solid fa-money-bill-transfer' },
          { title: 'انتقال قرارداد', icon: 'fa-solid fa-right-left' },
          { title: 'مشخصات خریدار', icon: 'fa-solid fa-user-pen' },
          { title: 'مشخصات واحد', icon: 'fa-solid fa-city' },
          { title: 'مدارک قرارداد', icon: 'fa-solid fa-folder-open' },
          { title: 'تخفیف', icon: 'fa-solid fa-tags', dim: true },
          { title: 'فسخ قرارداد', icon: 'fa-solid fa-file-circle-xmark' },
          { title: 'اقاله/رای قضایی', icon: 'fa-regular fa-file-lines', badge: '۱' },
          { title: 'تحویل سند', icon: 'fa-solid fa-key' },
          { title: 'جرائم کارفرما', icon: 'fa-solid fa-gavel', dim: true },
          { title: 'سررسید و فیش واریزی', icon: 'fa-solid fa-calendar-check' },
          { title: 'ویرایش قرارداد نهایی شده', icon: 'fa-solid fa-pen-to-square' },
          { title: 'ویرایش پیش نویس', icon: 'fa-regular fa-file', dim: true },
          { title: 'متمم قرارداد', icon: 'fa-solid fa-file-circle-plus' },
          { title: 'مشاهده پیش نویس', icon: 'fa-solid fa-eye' },
          { title: 'سرک واحد', icon: 'fa-solid fa-truck-ramp-box' },
          { title: 'جابجایی (فروش)', icon: 'fa-solid fa-map-location-dot', dim: true },
          { title: 'وام', icon: 'fa-solid fa-building-columns' },
          { title: 'تعدیل', icon: 'fa-solid fa-sliders' },
        ].map((item) => (
          <article key={item.title} className={`contract-details-action-card${item.dim ? ' is-dim' : ''}`}>
            {item.badge ? <div className="contract-details-badge-note">{item.badge}</div> : null}
            <div className="contract-details-action-head">
              <span className="contract-details-action-arrow">
                <i className="fa-solid fa-angle-left" />
              </span>
              <span className="contract-details-action-illustration">
                <i className={item.icon} />
              </span>
            </div>
            <h3 className="contract-details-action-title">{item.title}</h3>
            <p className="contract-details-action-text">—</p>
          </article>
        ))}
      </section>
    </main>
  );
}

