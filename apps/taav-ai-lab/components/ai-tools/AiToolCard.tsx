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
      <div className="ai-lab-ai-tool-card-top">
        {isActive ? (
          <span className="ai-lab-ai-tool-badge ai-lab-ai-tool-badge--active">فعال</span>
        ) : (
          <>
            <span className="ai-lab-ai-tool-badge ai-lab-ai-tool-badge--soon">به‌زودی</span>
            <span className="ai-lab-ai-tool-lock" aria-hidden="true">
              <Lock className="h-3.5 w-3.5" />
            </span>
          </>
        )}
      </div>

      <div className={`ai-lab-ai-tool-icon ${isActive ? 'is-active' : ''}`}>
        {tool.icon === 'ocr' ? (
          <div className="ai-lab-ai-tool-icon-ocr">
            {ICONS[tool.icon]}
            <span>OCR</span>
          </div>
        ) : (
          ICONS[tool.icon]
        )}
      </div>

      <div className="ai-lab-ai-tool-copy">
        <h3>{tool.title}</h3>
        <p>{tool.description}</p>
      </div>

      <div className="ai-lab-ai-tool-footer">
        {isActive && href && tool.ctaLabel ? (
          <span className="ai-lab-ai-tool-cta">
            <span aria-hidden="true">‹</span>
            {tool.ctaLabel}
          </span>
        ) : (
          <span className="ai-lab-ai-tool-soon-foot">بعداً توسعه داده می‌شود</span>
        )}
      </div>
    </>
  );

  if (isActive && href) {
    return (
      <Link href={href} className="ai-lab-ai-tool-card ai-lab-ai-tool-card--active">
        {content}
      </Link>
    );
  }

  return (
    <article className="ai-lab-ai-tool-card ai-lab-ai-tool-card--disabled" aria-disabled="true">
      {content}
    </article>
  );
}
