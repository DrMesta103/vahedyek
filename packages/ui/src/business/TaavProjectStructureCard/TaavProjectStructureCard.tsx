'use client';

import type { CSSProperties, ReactNode } from 'react';
import { AlertCircle, ChevronLeft, Copy, Edit3, MoreVertical, Trash2, WandSparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

export type TaavProjectStructureCardProps = {
  entityType?: 'block' | 'floor' | 'unit' | 'plate' | 'area' | 'custom';
  variant?: 'full' | 'compact' | 'usageOnly' | 'report' | 'minimal';
  tone?: 'teal' | 'gold' | 'gray' | 'custom';
  title: string;
  subtitle?: string;
  locationText?: string;
  headerImage?: string;
  headerLabel?: string;
  usageTitle?: string;
  usageTypes?: Array<{
    key: string;
    label: string;
    tone?: 'default' | 'blue' | 'orange' | 'teal' | 'gray';
  }>;
  activeUsageType?: string;
  onUsageTypeClick?: (usageType: NonNullable<TaavProjectStructureCardProps['usageTypes']>[number]) => void;
  showMenu?: boolean;
  onMenuClick?: () => void;
  onCardClick?: () => void;
  menuActions?: TaavProjectStructureCardAction[];
  showNavigate?: boolean;
  onNavigate?: () => void;
  progressReport?: {
    title: string;
    description?: string;
    moreLabel?: string;
    onMoreClick?: () => void;
    moreHint?: string;
    statusLabel?: string;
    status?: 'incomplete' | 'complete' | 'warning' | 'neutral';
    onClick?: () => void;
  };
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export type TaavProjectStructureCardAction = {
  key: string;
  label: string;
  icon?: 'edit' | 'copy' | 'delete' | 'custom';
  onClick?: () => void;
  disabled?: boolean;
};

type ToneTokens = {
  headerBackground: string;
  headerOverlay: string;
  borderColor: string;
  titleColor: string;
  chipBorderColor: string;
  chipTextColor: string;
  activeChipBorderColor: string;
  activeChipTextColor: string;
  statusColor: string;
  dividerColor: string;
};

const TONE_TOKENS: Record<Exclude< TaavProjectStructureCardProps['tone'], undefined>, ToneTokens> = {
  teal: {
    headerBackground: '#6d9eae', headerOverlay: '#477f91', borderColor: '#b7cbd5', titleColor: '#3f4d55',
    chipBorderColor: '#a4b7c4', chipTextColor: '#718290', activeChipBorderColor: '#3b82f6', activeChipTextColor: '#2563eb',
    statusColor: '#ef4444', dividerColor: '#83a7b6',
  },
  gold: {
    headerBackground: '#b4a675', headerOverlay: '#918352', borderColor: '#d5cda9', titleColor: '#514a38',
    chipBorderColor: '#b5ae9a', chipTextColor: '#827b68', activeChipBorderColor: '#f59e0b', activeChipTextColor: '#f59e0b',
    statusColor: '#ef4444', dividerColor: '#b9aa76',
  },
  gray: {
    headerBackground: '#7c8992', headerOverlay: '#5c6870', borderColor: '#c4cbd0', titleColor: '#4b5560',
    chipBorderColor: '#aeb8bf', chipTextColor: '#71808b', activeChipBorderColor: '#64748b', activeChipTextColor: '#475569',
    statusColor: '#ef4444', dividerColor: '#aab5bc',
  },
  custom: {
    headerBackground: 'var(--taav-structure-header, #6d9eae)', headerOverlay: 'var(--taav-structure-overlay, #477f91)',
    borderColor: 'var(--taav-structure-border, #b7cbd5)', titleColor: 'var(--taav-structure-title, #3f4d55)',
    chipBorderColor: 'var(--taav-structure-chip-border, #a4b7c4)', chipTextColor: 'var(--taav-structure-chip-text, #718290)',
    activeChipBorderColor: 'var(--taav-structure-active-border, #3b82f6)', activeChipTextColor: 'var(--taav-structure-active-text, #2563eb)',
    statusColor: 'var(--taav-structure-status, #ef4444)', dividerColor: 'var(--taav-structure-divider, #83a7b6)',
  },
};

const ACTIVE_CHIP_COLORS: Record<string, { border: string; text: string }> = {
  blue: { border: '#3b82f6', text: '#2563eb' }, orange: { border: '#f59e0b', text: '#f59e0b' },
  teal: { border: '#0f9aa8', text: '#087f8d' }, gray: { border: '#64748b', text: '#475569' }, default: { border: '#64748b', text: '#475569' },
};

function Header({ title, headerLabel, headerImage, tokens }: Pick<TaavProjectStructureCardProps, 'title' | 'headerLabel' | 'headerImage'> & { tokens: ToneTokens }) {
  const style = { '--structure-header': tokens.headerBackground, '--structure-overlay': tokens.headerOverlay, ...(headerImage ? { backgroundImage: `url(${headerImage})` } : {}) } as CSSProperties;
  return <header className="relative flex min-h-[88px] items-center overflow-hidden rounded-t-[16px] bg-[var(--structure-header)] px-5 py-4 text-white" style={style}>
    {!headerImage && <span aria-hidden className="absolute inset-0 opacity-80 [background:linear-gradient(135deg,transparent_0_55%,var(--structure-overlay)_55%_72%,transparent_72%),linear-gradient(90deg,transparent_0_58%,rgba(255,255,255,.06)_58%_59%,transparent_59%)]" />}
    <h3 className="relative z-10 m-0 min-w-0 flex-1 truncate text-right text-[21px] font-extrabold leading-8">{headerLabel ?? title}</h3>
  </header>;
}

function ActionIcon({ icon }: { icon?: TaavProjectStructureCardAction['icon'] }) {
  if (icon === 'edit') return <Edit3 className="h-5 w-5" strokeWidth={1.7} />;
  if (icon === 'copy') return <Copy className="h-5 w-5" strokeWidth={1.7} />;
  if (icon === 'delete') return <Trash2 className="h-5 w-5" strokeWidth={1.7} />;
  return <WandSparkles className="h-5 w-5" strokeWidth={1.7} />;
}

function MenuButton({ onClick, open }: { onClick?: () => void; open: boolean }) {
  return <button type="button" aria-label="منوی کارت" aria-expanded={open} onClick={(event) => { event.stopPropagation(); onClick?.(); }} className={cn('absolute left-4 top-[104px] z-20 inline-flex h-7 w-7 items-center justify-center rounded-md text-[#555b60] transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5b92a3]', open && 'text-[#2f6979]')}><MoreVertical className="h-5 w-5" /></button>;
}

function ActionMenu({ actions, tokens }: { actions: TaavProjectStructureCardAction[]; tokens: ToneTokens }) {
  return <div dir="rtl" className="absolute left-4 top-[95px] z-30 w-[126px] overflow-hidden rounded-[16px] border-0 bg-[#f1f2f3] p-[7px] text-right shadow-[0_7px_18px_rgba(30,44,52,.2)]" style={{ borderColor: tokens.borderColor }} role="menu">
    {actions.map((action) => <button key={action.key} type="button" role="menuitem" disabled={action.disabled || !action.onClick} onClick={action.onClick} className="flex h-[52px] w-full items-center justify-between gap-4 rounded-[9px] px-3 text-[14px] font-normal leading-6 text-[#4c5155] transition hover:bg-[#e1e4e6] focus-visible:bg-[#e1e4e6] focus-visible:outline-none disabled:cursor-default disabled:opacity-45">
      <ActionIcon icon={action.icon} /><span>{action.label}</span>
    </button>)}
  </div>;
}

function UsageChips({ usageTitle, usageTypes, activeUsageType, onUsageTypeClick, tokens }: Pick<TaavProjectStructureCardProps, 'usageTitle' | 'usageTypes' | 'activeUsageType' | 'onUsageTypeClick'> & { tokens: ToneTokens }) {
  if (!usageTypes?.length) return null;
  return <section className="mt-3" aria-label={usageTitle ?? 'نوع کاربری'}>
    <h4 className="m-0 text-right text-[17px] font-bold leading-7 text-[#555b60]">{usageTitle ?? 'نوع کاربری'}</h4>
    <div className="mt-2 flex flex-wrap justify-start gap-1.5">
      {usageTypes.map((usage) => {
        const active = usage.key === activeUsageType;
        const colors = active ? ACTIVE_CHIP_COLORS[usage.tone ?? 'default'] ?? { border: tokens.activeChipBorderColor, text: tokens.activeChipTextColor } : null;
        const Chip = onUsageTypeClick ? 'button' : 'span';
        return <Chip key={usage.key} type={onUsageTypeClick ? 'button' : undefined} onClick={onUsageTypeClick ? (event) => { event.stopPropagation(); onUsageTypeClick(usage); } : undefined} className={cn('inline-flex min-h-7 items-center rounded-full border bg-white px-2.5 text-[12px] font-medium leading-5 transition', onUsageTypeClick && 'cursor-pointer hover:bg-[#f1f5f6] hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5b92a3]')} style={{ borderColor: colors?.border ?? tokens.chipBorderColor, color: colors?.text ?? tokens.chipTextColor }}>{usage.label}</Chip>;
      })}
    </div>
  </section>;
}

function ProgressReport({ report, tokens, resetKey }: { report: NonNullable<TaavProjectStructureCardProps['progressReport']>; tokens: ToneTokens; resetKey: number }) {
  const [moreOpen, setMoreOpen] = useState(false);
  useEffect(() => setMoreOpen(false), [resetKey]);
  const status = report.statusLabel ?? (report.status === 'complete' ? 'تکمیل شده' : 'تکمیل نشده');
  return <section className="mt-3 border-t pt-3" style={{ borderColor: tokens.dividerColor }}>
    <h4 className="m-0 text-right text-[15px] font-bold leading-6 text-[#4f5559] line-clamp-2">{report.title}</h4>
    {report.description && <div className="mt-1 flex min-w-0 items-center gap-1 text-right">
      <p className="m-0 min-w-0 flex-1 truncate whitespace-nowrap text-right text-[11px] leading-5 text-[#656b70]">{report.description}</p>
      <button type="button" onClick={(event) => { event.stopPropagation(); setMoreOpen((open) => !open); report.onMoreClick?.(); }} className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[11px] leading-5 text-[#0b9aa5] underline-offset-2 hover:underline">
        <span>{report.moreLabel ?? 'بیشتر'}</span><ChevronLeft className="h-[15px] w-[15px]" strokeWidth={2.1} />
      </button>
    </div>}
    {moreOpen && <div className="mt-2 rounded-[3px] border border-[#e0e3e5] bg-[#fafafa] px-3 py-2 text-right text-[11px] leading-5 text-[#656b70] shadow-[0_1px_3px_rgba(30,44,52,.05)]">{report.moreHint ?? report.description}</div>}
    <div className="relative mt-1.5 min-h-7">
      <button type="button" onClick={(event) => { event.stopPropagation(); report.onClick?.(); }} disabled={!report.onClick} className="flex w-full items-center justify-start gap-1 text-[11px] leading-5 disabled:cursor-default" style={{ color: tokens.statusColor }}><AlertCircle className="h-3.5 w-3.5" />{status}</button>
    </div>
  </section>;
}

export function TaavProjectStructureCard({ entityType = 'custom', variant = 'full', tone = 'teal', title, subtitle, locationText, headerImage, headerLabel, usageTitle, usageTypes, activeUsageType, onUsageTypeClick, showMenu = false, onMenuClick, onCardClick, menuActions, showNavigate = false, onNavigate, progressReport, disabled = false, loading = false, className }: TaavProjectStructureCardProps) {
  const tokens = TONE_TOKENS[tone];
  const [menuOpen, setMenuOpen] = useState(false);
  const [cardClickVersion, setCardClickVersion] = useState(0);
  const compact = variant === 'compact' || variant === 'usageOnly' || variant === 'minimal';
  const showUsage = variant === 'full' || variant === 'compact' || variant === 'usageOnly' || variant === 'minimal';
  const showReport = (variant === 'full' || variant === 'report') && Boolean(progressReport);
  return <article dir="rtl" data-taav-project-structure-card data-variant={variant} data-entity-type={entityType} aria-busy={loading || undefined} aria-disabled={disabled || undefined} onClick={() => { setMenuOpen(false); setCardClickVersion((version) => version + 1); onCardClick?.(); }} className={cn('relative w-full max-w-[300px] cursor-pointer overflow-visible rounded-[16px] border bg-white text-right shadow-[0_2px_8px_rgba(28,54,65,.04)] transition hover:shadow-[0_5px_16px_rgba(28,54,65,.09)]', compact ? 'max-h-[280px]' : 'min-h-[376px]', disabled && 'pointer-events-none opacity-55', loading && 'animate-pulse', className)} style={{ borderColor: tokens.borderColor }}>
    <Header title={title} headerLabel={headerLabel} headerImage={headerImage} tokens={tokens} />
    {showMenu && !loading && <><MenuButton open={menuOpen} onClick={() => { setMenuOpen((open) => !open); onMenuClick?.(); }} />{menuOpen && menuActions?.length ? <div onClick={(event) => event.stopPropagation()}><ActionMenu actions={menuActions} tokens={tokens} /></div> : null}</>}
    <div className={cn('relative px-4 pb-4 pt-3', compact ? 'min-h-[124px]' : 'min-h-[284px]')}>
      {(subtitle || locationText) && variant !== 'usageOnly' && variant !== 'minimal' && <p className="m-0 max-w-[calc(100%-2rem)] truncate text-right text-[13px] leading-6 text-[#61676b]">{subtitle ?? locationText}</p>}
      {showUsage && <UsageChips usageTitle={usageTitle} usageTypes={usageTypes} activeUsageType={activeUsageType} onUsageTypeClick={onUsageTypeClick} tokens={tokens} />}
      {showReport && progressReport && <ProgressReport report={progressReport} tokens={tokens} resetKey={cardClickVersion} />}
      {!showReport && showNavigate && <button type="button" aria-label="مشاهده جزئیات" onClick={(event) => { event.stopPropagation(); onNavigate?.(); }} className="absolute bottom-3 left-4 text-[#5e8998]"><ChevronLeft className="h-[19px] w-[19px]" strokeWidth={2.1} /></button>}
    </div>
  </article>;
}
