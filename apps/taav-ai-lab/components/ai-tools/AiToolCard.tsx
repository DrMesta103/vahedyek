'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  AudioLines,
  FileText,
  Globe,
  Lock,
  Mic,
  ScanText,
  Table2,
  Tags,
  Video,
  Volume2,
} from 'lucide-react';
import type { AiToolDefinition, AiToolIconKey } from '@/app/lib/ai-tools-catalog';
import styles from './ai-tools.module.css';

const ICONS: Record<AiToolIconKey, ReactNode> = {
  ocr: <ScanText className="h-6 w-6" strokeWidth={1.7} />,
  'speech-to-text': <AudioLines className="h-6 w-6" strokeWidth={1.7} />,
  'text-to-speech': <Volume2 className="h-6 w-6" strokeWidth={1.7} />,
  'web-scraper': <Globe className="h-6 w-6" strokeWidth={1.7} />,
  'video-analysis': <Video className="h-6 w-6" strokeWidth={1.7} />,
  'live-voice': <Mic className="h-6 w-6" strokeWidth={1.7} />,
  'file-summary': <FileText className="h-6 w-6" strokeWidth={1.7} />,
  'smart-category': <Tags className="h-6 w-6" strokeWidth={1.7} />,
  'structured-extraction': <Table2 className="h-6 w-6" strokeWidth={1.7} />,
};

type AiToolCardProps = {
  tool: AiToolDefinition;
  businessId: string;
};

export function AiToolCard({ tool, businessId }: AiToolCardProps) {
  const isActive = tool.status === 'active';
  const href = isActive && tool.segment ? `/businesses/${businessId}/ai-tools/${tool.segment}` : undefined;

  const content = (
    <>
      <div className={styles.cardTop}>
        {isActive ? (
          <span className={`${styles.badge} ${styles.badgeActive}`}>فعال</span>
        ) : (
          <>
            <span className={`${styles.badge} ${styles.badgeSoon}`}>به‌زودی</span>
            <span className={styles.lock} aria-hidden="true">
              <Lock className="h-3.5 w-3.5" />
            </span>
          </>
        )}
      </div>

      <div className={`${styles.icon} ${isActive ? styles.iconActive : ''}`}>
        {tool.icon === 'ocr' ? (
          <div className={styles.iconOcr}>
            {ICONS[tool.icon]}
            <span>OCR</span>
          </div>
        ) : (
          ICONS[tool.icon]
        )}
      </div>

      <div className={styles.copy}>
        <h3>{tool.title}</h3>
        <p>{tool.description}</p>
      </div>

      <div className={styles.footer}>
        {isActive && href && tool.ctaLabel ? (
          <span className={styles.cta}>
            <span aria-hidden="true">‹</span>
            {tool.ctaLabel}
          </span>
        ) : (
          <span className={styles.soonFoot}>بعداً توسعه داده می‌شود</span>
        )}
      </div>
    </>
  );

  if (isActive && href) {
    return (
      <Link href={href} className={`${styles.card} ${styles.cardActive}`}>
        {content}
      </Link>
    );
  }

  return (
    <article className={`${styles.card} ${styles.cardDisabled}`} aria-disabled="true">
      {content}
    </article>
  );
}
