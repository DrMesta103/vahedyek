'use client';

import type { CSSProperties } from 'react';
import type { Contract, ContractType } from '../../types/contract';

interface ContractOverviewCardsProps {
  contracts: Contract[];
}

interface ChartSegment {
  label: string;
  value: number;
  color: string;
}

interface OverviewCardConfig {
  title: string;
  centerLabel: string;
  chartMode: 'solid' | 'pie';
  centerValueOverride?: number;
  segments: ChartSegment[];
}

const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  sale: 'فروش',
  'pre-sale': 'پیش‌فروش',
};

function buildChartBackground(segments: ChartSegment[], chartMode: 'solid' | 'pie'): string {
  const nonZeroSegments = segments.filter((segment) => segment.value > 0);

  if (nonZeroSegments.length === 0) {
    return '#f59e0b';
  }

  if (chartMode === 'solid' || nonZeroSegments.length === 1) {
    return nonZeroSegments[0].color;
  }

  const total = nonZeroSegments.reduce((sum, segment) => sum + segment.value, 0);
  let current = 0;

  return `conic-gradient(${nonZeroSegments
    .map((segment) => {
      const start = current;
      current += (segment.value / total) * 360;
      return `${segment.color} ${start}deg ${current}deg`;
    })
    .join(', ')})`;
}

function OverviewCard({ title, centerLabel, chartMode, centerValueOverride, segments }: OverviewCardConfig) {
  const total = centerValueOverride ?? segments.reduce((sum, segment) => sum + segment.value, 0);
  const chartStyle: CSSProperties = {
    background: buildChartBackground(segments, chartMode),
  };

  return (
    <article className="contracts-overview-card">
      <div className="contracts-overview-card-head">
        <h3>{title}</h3>
      </div>

      <div className="contracts-overview-card-body">
        <div className={`contracts-overview-chart${chartMode === 'pie' ? ' is-pie' : ' is-solid'}`} style={chartStyle}>
          <div className={`contracts-overview-chart-core${chartMode === 'solid' ? ' is-solid' : ''}`}>
            <strong>{total.toLocaleString('fa-IR')}</strong>
            <span>{centerLabel}</span>
          </div>
        </div>

        <div className="contracts-overview-legend">
          {segments.map((segment) => (
            <div key={segment.label} className="contracts-overview-legend-item">
              <span>{segment.label}</span>
              <div className="contracts-overview-legend-meta">
                <strong>{segment.value.toLocaleString('fa-IR')}</strong>
                <i style={{ backgroundColor: segment.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function ContractOverviewCards({ contracts }: ContractOverviewCardsProps) {
  const deliveryReadyCount = contracts.filter((contract) => Boolean(contract.data.subject.deliveryDate)).length;
  const noDeliveryDateCount = contracts.length - deliveryReadyCount;

  const preSaleCount = contracts.filter((contract) => contract.data.subject.contractType === 'pre-sale').length;
  const saleCount = contracts.filter((contract) => contract.data.subject.contractType === 'sale').length;

  const cards: OverviewCardConfig[] = [
    {
      title: 'نمودار براساس وضعیت قرارداد',
      centerLabel: 'واحد',
      chartMode: 'solid',
      centerValueOverride: contracts.length,
      segments: [
        { label: 'پیش‌نویس', value: contracts.filter((contract) => contract.status === 'draft').length, color: '#f59e0b' },
        { label: 'در انتظار تایید', value: contracts.filter((contract) => contract.status === 'pending_approval').length, color: '#16a34a' },
        { label: 'تکمیل شده', value: contracts.filter((contract) => contract.status === 'completed').length, color: '#0891b2' },
      ],
    },
    {
      title: 'نمودار براساس نوع کاربری',
      centerLabel: 'مورد',
      chartMode: 'pie',
      segments: [
        { label: 'مسکونی', value: preSaleCount, color: '#28a745' },
        { label: 'اداری', value: saleCount, color: '#ff5252' },
        { label: 'تجاری', value: 0, color: '#1f9fc4' },
        { label: 'پارکینگ', value: 0, color: '#f59e0b' },
      ],
    },
    {
      title: 'نمودار براساس وضعیت تحویل واحد',
      centerLabel: 'واحد',
      chartMode: 'solid',
      centerValueOverride: contracts.length,
      segments: [
        { label: 'تحویل داده شده', value: deliveryReadyCount, color: '#22c55e' },
        { label: 'تحویل داده نشده', value: noDeliveryDateCount, color: '#f59e0b' },
      ],
    },
  ];

  return (
    <section className="contracts-overview-grid">
      {cards.map((card) => (
        <OverviewCard key={card.title} {...card} />
      ))}
    </section>
  );
}
