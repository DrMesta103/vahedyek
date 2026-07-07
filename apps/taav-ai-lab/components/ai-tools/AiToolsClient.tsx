'use client';

import { Activity, LayoutGrid, Sparkles } from 'lucide-react';
import { AI_TOOLS_CATALOG, getAiToolsStats } from '@/app/lib/ai-tools-catalog';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { AiLabTooltipIcon } from '@/components/AiLabTooltip';
import { AiToolCard } from './AiToolCard';
import styles from './ai-tools.module.css';

type AiToolsClientProps = {
  businessId: string;
};

export function AiToolsClient({ businessId }: AiToolsClientProps) {
  const { activeCount, upcomingCount } = getAiToolsStats();

  return (
    <div className={styles.page} dir="rtl" lang="fa">
      <section className={styles.hero}>
        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.heroGlow} />
          <div className={styles.heroPlatform}>
            <div className={styles.heroCube}>
              <Sparkles className="h-7 w-7" strokeWidth={1.6} />
            </div>
          </div>
        </div>

        <div className={styles.heroCopy}>
          <span className={styles.phaseBadge}>فاز ۱</span>
          <h1>
            ابزارهای هوش مصنوعی
            <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.nav['ai-tools']} label="راهنمای ابزارهای هوش مصنوعی" />
          </h1>
          <p>مجموعه‌ای از ابزارهای هوشمند فعال و در حال توسعه آزمایشگاه. ابزار مناسب خود را انتخاب کنید.</p>

          <div className={styles.stats}>
            <article>
              <span className={styles.statIcon}>
                <Activity className="h-4 w-4" />
              </span>
              <div>
                <span>تعداد ابزار فعال</span>
                <strong>{new Intl.NumberFormat('fa-IR').format(activeCount)}</strong>
              </div>
            </article>
            <article>
              <span className={styles.statIcon}>
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

      <section className={styles.grid} aria-label="فهرست ابزارهای هوش مصنوعی">
        {AI_TOOLS_CATALOG.map((tool) => (
          <AiToolCard key={tool.key} tool={tool} businessId={businessId} />
        ))}
      </section>
    </div>
  );
}
