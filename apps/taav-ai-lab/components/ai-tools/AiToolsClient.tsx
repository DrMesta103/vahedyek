'use client';

import { Activity, LayoutGrid, Sparkles } from 'lucide-react';
import { AI_TOOLS_CATALOG, getAiToolsStats } from '@/app/lib/ai-tools-catalog';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { AiLabTooltipIcon } from '@/components/AiLabTooltip';
import { AiToolCard } from './AiToolCard';

type AiToolsClientProps = {
  businessId: string;
};

export function AiToolsClient({ businessId }: AiToolsClientProps) {
  const { activeCount, upcomingCount } = getAiToolsStats();

  return (
    <div className="ai-lab-ai-tools-page" dir="rtl" lang="fa">
      <section className="ai-lab-ai-tools-hero">
        <div className="ai-lab-ai-tools-hero-visual" aria-hidden="true">
          <div className="ai-lab-ai-tools-hero-glow" />
          <div className="ai-lab-ai-tools-hero-platform">
            <div className="ai-lab-ai-tools-hero-cube">
              <Sparkles className="h-7 w-7" strokeWidth={1.6} />
            </div>
          </div>
        </div>

        <div className="ai-lab-ai-tools-hero-copy">
          <span className="ai-lab-ai-tools-phase-badge">فاز ۱</span>
          <h1>
            ابزارهای هوش مصنوعی
            <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.nav['ai-tools']} label="راهنمای ابزارهای هوش مصنوعی" />
          </h1>
          <p>مجموعه‌ای از ابزارهای هوشمند فعال و در حال توسعه آزمایشگاه. ابزار مناسب خود را انتخاب کنید.</p>

          <div className="ai-lab-ai-tools-stats">
            <article>
              <span className="ai-lab-ai-tools-stat-icon">
                <Activity className="h-4 w-4" />
              </span>
              <div>
                <span>تعداد ابزار فعال</span>
                <strong>{new Intl.NumberFormat('fa-IR').format(activeCount)}</strong>
              </div>
            </article>
            <article>
              <span className="ai-lab-ai-tools-stat-icon">
                <LayoutGrid className="h-4 w-4" />
              </span>
              <div>
                <span>ابزارهای آینده</span>
                <strong>{new Intl.NumberFormat('fa-IR').format(upcomingCount)}</strong>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="ai-lab-ai-tools-grid" aria-label="فهرست ابزارهای هوش مصنوعی">
        {AI_TOOLS_CATALOG.map((tool) => (
          <AiToolCard key={tool.key} tool={tool} businessId={businessId} />
        ))}
      </section>
    </div>
  );
}
