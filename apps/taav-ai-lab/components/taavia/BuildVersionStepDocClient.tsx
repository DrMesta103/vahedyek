'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Copy,
  CircleHelp,
  Database,
  FileJson,
  Globe,
  Layers3,
  LockKeyhole,
  type LucideIcon,
} from 'lucide-react';
import {
  TaavBadge,
  TaavButton,
  TaavCard,
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';
import type {
  BuildVersionStepDocCard,
  BuildVersionStepDocCardTag,
} from '@/app/lib/taavia-build-version-step-doc-types';

const TAG_TONE: Record<BuildVersionStepDocCardTag, 'brand' | 'info' | 'neutral'> = {
  فرانت: 'brand',
  بک: 'info',
  عمومی: 'neutral',
};

const CARD_ICONS: Record<BuildVersionStepDocCard['kind'], LucideIcon> = {
  text: Layers3,
  api: Globe,
  'detail-list': CheckCircle2,
  lock: LockKeyhole,
  'build-summary': Database,
  event: FileJson,
  transaction: ArrowLeft,
  response: CheckCircle2,
  checklist: CheckCircle2,
};

const FIELD_DETAIL_ORDERS = new Set([4, 6, 7, 8]);

type DialogState = {
  title: string;
  description: string;
  body: ReactNode;
} | null;

type BuildVersionStepDocClientProps = {
  cards: BuildVersionStepDocCard[];
  overviewSteps: readonly string[];
  overviewNote: string;
};

function CopyCodeButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <TaavButton
      variant="ghost"
      size="sm"
      iconStart={<Copy className="h-4 w-4" />}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? 'کپی شد' : 'کپی'}
    </TaavButton>
  );
}

function CodePanel({ code }: { code: string }) {
  return (
    <div className="rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--taav-border-subtle)] px-3 py-2">
        <span className="text-[length:var(--taav-text-xs)] font-semibold text-[var(--taav-text-subtle)]">JSON</span>
        <CopyCodeButton value={code} />
      </div>
      <pre className="m-0 overflow-x-auto p-3 text-left text-[13px] leading-6 text-[var(--taav-text-strong)]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function OverviewStrip({ steps, note }: { steps: readonly string[]; note: string }) {
  return (
    <TaavCard variant="outlined" padding="md" radius="xl">
      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-[length:var(--taav-text-base)] font-black text-[var(--taav-text-strong)]">نمای کلی مرحله</h2>
        </div>
        <div className="overflow-x-auto">
          <div dir="ltr" className="flex min-w-max items-center gap-2">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              return (
                <div key={step} className="flex items-center gap-2">
                  <div className="flex min-w-[11rem] items-center justify-between gap-3 rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 py-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--taav-brand-soft)] text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-brand-strong)]">
                      {index + 1}
                    </span>
                    <span className="text-right text-[length:var(--taav-text-sm)] font-semibold text-[var(--taav-text-strong)]">
                      {step}
                    </span>
                  </div>
                  {!isLast ? <ArrowRight className="h-4 w-4 shrink-0 text-[var(--taav-text-subtle)]" aria-hidden /> : null}
                </div>
              );
            })}
          </div>
        </div>
        <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">{note}</p>
      </div>
    </TaavCard>
  );
}

function CardNumber({ order }: { order: number }) {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--taav-brand-soft)] text-[length:var(--taav-text-sm)] font-black text-[var(--taav-brand-strong)]">
      {order}
    </span>
  );
}

function MiniSequence({ steps }: { steps: string[] }) {
  return (
    <div className="grid gap-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-text-muted)]">
            {index + 1}
          </span>
          <span>{step}</span>
        </div>
      ))}
    </div>
  );
}

function FieldDetails({ fields }: { fields: Array<{ label: string; value: string; description: string }> }) {
  return (
    <div className="grid gap-2.5">
      {fields.map((field) => (
        <div
          key={field.label}
          className="grid gap-1.5 rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 py-2.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[length:var(--taav-text-sm)] font-bold text-[var(--taav-text-strong)]">{field.label}</span>
            <code className="text-left text-[13px] text-[var(--taav-text-muted)]">{field.value}</code>
          </div>
          <p className="m-0 text-[length:var(--taav-text-xs)] leading-6 text-[var(--taav-text-muted)]">{field.description}</p>
        </div>
      ))}
    </div>
  );
}

function TabbedDetail({
  tabs,
}: {
  tabs: Array<{ id: string; label: string; description: string; items: string[] }>;
}) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? '');
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  if (!activeTab) return null;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-2 rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] p-1" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === activeTab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`rounded-[var(--taav-radius-md)] px-3 py-2 text-sm font-bold transition-colors ${
              tab.id === activeTab.id
                ? 'bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]'
                : 'text-[var(--taav-text-muted)] hover:bg-[var(--taav-surface-raised)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="grid gap-3">
        <p className="m-0 text-sm leading-7 text-[var(--taav-text-muted)]">{activeTab.description}</p>
        {activeTab.items.map((item) => (
          <div key={item} className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--taav-brand-strong)]" />
            <p className="m-0 text-sm leading-7 text-[var(--taav-text-strong)]">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailTrigger({ order, label, onClick }: { order: number; label: string; onClick: () => void }) {
  const isFieldDetail = FIELD_DETAIL_ORDERS.has(order);

  return (
    <TaavButton
      variant="secondary"
      size="sm"
      iconStart={isFieldDetail ? <CircleHelp className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      aria-label={isFieldDetail ? label : undefined}
      title={isFieldDetail ? label : undefined}
      onClick={onClick}
    >
      {isFieldDetail ? null : label}
    </TaavButton>
  );
}

function CardBody({
  card,
  onOpenDetail,
}: {
  card: BuildVersionStepDocCard;
  onOpenDetail: (card: BuildVersionStepDocCard) => void;
}) {
  switch (card.kind) {
    case 'text':
      return (
        <div className="grid gap-2">
          {card.summaryLines.map((line) => (
            <p key={line} className="m-0 text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
              {line}
            </p>
          ))}
        </div>
      );
    case 'api':
      return (
        <div className="grid gap-3">
          <div className="rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 py-2.5 text-left text-[13px] text-[var(--taav-text-strong)]">
            <code>{card.endpoint}</code>
          </div>
          <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">{card.requestBodyLabel}</p>
        </div>
      );
    case 'detail-list':
      return (
        <div className="grid gap-3">
          {card.summaryLines.map((line) => (
            <p key={line} className="m-0 text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
              {line}
            </p>
          ))}
          <div>
            <DetailTrigger order={card.order} label={card.actionLabel} onClick={() => onOpenDetail(card)} />
          </div>
        </div>
      );
    case 'lock':
      return (
        <div className="grid gap-3">
          <div className="rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 py-2.5 text-left text-[13px] text-[var(--taav-text-strong)]">
            <code>{card.lockKey}</code>
          </div>
          <TaavBadge tone="brand" variant="soft" size="sm">
            {card.mechanism}
          </TaavBadge>
          <p className="m-0 text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">{card.note}</p>
        </div>
      );
    case 'build-summary':
      return (
        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            {card.summaryItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 py-1.5 text-[length:var(--taav-text-xs)] font-semibold text-[var(--taav-text-strong)]"
              >
                {item}
              </span>
            ))}
          </div>
          {card.actionLabel && card.detail ? (
            <div>
              <DetailTrigger order={card.order} label={card.actionLabel} onClick={() => onOpenDetail(card)} />
            </div>
          ) : null}
        </div>
      );
    case 'event':
      return (
        <div className="grid gap-3">
          <p className="m-0 text-[length:var(--taav-text-sm)] font-semibold text-[var(--taav-text-strong)]">{card.eventName}</p>
          <div className="flex flex-wrap gap-2">
            {card.eventChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 py-1.5 text-[length:var(--taav-text-xs)] font-semibold text-[var(--taav-text-strong)]"
              >
                {chip}
              </span>
            ))}
          </div>
          <p className="m-0 text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">{card.note}</p>
          <div>
            <DetailTrigger order={card.order} label={card.actionLabel} onClick={() => onOpenDetail(card)} />
          </div>
        </div>
      );
    case 'transaction':
      return (
        <div className="grid gap-3">
          <MiniSequence steps={card.steps} />
          <p className="m-0 text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">{card.note}</p>
        </div>
      );
    case 'response':
      return (
        <div className="grid gap-3">
          <TaavBadge tone="success" variant="soft" size="sm">
            {card.status}
          </TaavBadge>
          <CodePanel code={card.code} />
        </div>
      );
    case 'checklist':
      return (
        <div className="grid gap-2.5">
          {card.items.map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--taav-brand-strong)]" />
              <p className="m-0 text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">{item}</p>
            </div>
          ))}
        </div>
      );
  }
}

function getDialogState(card: BuildVersionStepDocCard): DialogState {
  if (!card.actionLabel || !card.detail) {
    return null;
  }

  if (card.detail.type === 'bullet-list') {
    return {
      title: card.detail.title,
      description: card.detail.description,
      body: (
        <div className="grid gap-3">
          {card.detail.items.map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--taav-brand-strong)]" />
              <p className="m-0 text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">{item}</p>
            </div>
          ))}
        </div>
      ),
    };
  }

  if (card.detail.type === 'kv-list') {
    return {
      title: card.detail.title,
      description: card.detail.description,
      body: (
        <div className="grid gap-2">
          {card.detail.items.map((item) => (
            <div
              key={`${item.label}-${item.value}`}
              className="flex items-center justify-between gap-3 rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 py-2"
            >
              <span className="text-[length:var(--taav-text-sm)] font-semibold text-[var(--taav-text-strong)]">{item.label}</span>
              <div className="grid min-w-0 gap-1 text-left">
                <code className="text-[13px] text-[var(--taav-text-muted)]">{item.value}</code>
                {item.description ? (
                  <p className="m-0 text-right text-[length:var(--taav-text-xs)] leading-6 text-[var(--taav-text-muted)]">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ),
    };
  }

  if (card.detail.type === 'tabs') {
    return {
      title: card.detail.title,
      description: card.detail.description,
      body: <TabbedDetail tabs={card.detail.tabs} />,
    };
  }

  return {
    title: card.detail.title,
    description: card.detail.description,
    body: (
      <div className="grid gap-4">
        <CodePanel code={card.detail.code} />
        {card.detail.fields ? <FieldDetails fields={card.detail.fields} /> : null}
      </div>
    ),
  };
}

export function BuildVersionStepDocClient({ cards, overviewSteps, overviewNote }: BuildVersionStepDocClientProps) {
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  const dialogState = useMemo(() => {
    const card = cards.find((item) => item.id === openCardId);
    return card ? getDialogState(card) : null;
  }, [cards, openCardId]);

  return (
    <>
      <OverviewStrip steps={overviewSteps} note={overviewNote} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = CARD_ICONS[card.kind];

          return (
            <TaavCard
              key={card.id}
              variant="outlined"
              padding="md"
              radius="xl"
              wrapperClassName="h-full"
              contentClassName="grid h-full gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <CardNumber order={card.order} />
                  <div className="grid min-w-0 gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="m-0 text-[length:var(--taav-text-base)] font-black text-[var(--taav-text-strong)]">{card.title}</h2>
                      <TaavBadge tone={TAG_TONE[card.tag]} variant="soft" size="sm">
                        {card.tag}
                      </TaavBadge>
                    </div>
                  </div>
                </div>
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] text-[var(--taav-brand-strong)]">
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                </span>
              </div>

              <CardBody card={card} onOpenDetail={(item) => setOpenCardId(item.id)} />
            </TaavCard>
          );
        })}
      </div>

      <TaavDialog
        open={Boolean(dialogState)}
        onOpenChange={(open) => {
          if (!open) setOpenCardId(null);
        }}
      >
        <TaavDialogContent size="lg" contentClassName="ai-lab-dialog max-h-[min(88vh,720px)] overflow-y-auto">
          {dialogState ? (
            <>
              <TaavDialogHeader>
                <TaavDialogTitle>{dialogState.title}</TaavDialogTitle>
                <TaavDialogDescription>{dialogState.description}</TaavDialogDescription>
              </TaavDialogHeader>
              {dialogState.body}
            </>
          ) : null}
        </TaavDialogContent>
      </TaavDialog>
    </>
  );
}
