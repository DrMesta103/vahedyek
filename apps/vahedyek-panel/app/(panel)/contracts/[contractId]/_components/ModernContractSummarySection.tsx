'use client';

import { useEffect, useRef, useState } from 'react';
import type { ContractHistoryResponse } from '../../../../lib/contractHistory';

type ModernContractSummarySectionProps = {
  buyerName: string;
  blockName: string;
  contractDate: string;
  contractNumber: string;
  contractHistory: ContractHistoryResponse | null;
  contractStatusLabel: string;
  contractTypeLabel: string;
  floorName: string;
  receiptCount: number;
  unitLabel: string;
  amountRial: number;
};

const GRAPH_COLORS = ['#79ffe8', '#ffd88b', '#a989ff', '#5dffc7'];

function formatMoneyToman(valueRial: number) {
  if (!valueRial) return '—';
  const toman = Math.round(valueRial / 10);
  return `${toman.toLocaleString('fa-IR')} تومان`;
}

function formatHistoryDate(value: string | null | undefined) {
  if (!value) return '—';
  const trimmed = String(value).trim();
  if (!trimmed) return '—';

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;

  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(parsed);
}

function getHistoryVersionLabel(version: ContractHistoryResponse['versions'][number]) {
  if (version.kind === 'contract') return 'قرارداد';
  const title = String(version.title ?? '').trim();
  if (title) return title;
  return version.kind === 'appendix' ? 'متمم' : 'نسخه';
}

export function ModernContractSummarySection({
  buyerName,
  blockName,
  contractDate,
  contractNumber,
  contractHistory,
  contractStatusLabel,
  contractTypeLabel,
  floorName,
  receiptCount,
  unitLabel,
  amountRial,
}: ModernContractSummarySectionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const leftCardRef = useRef<HTMLElement | null>(null);
  const analysisCardRef = useRef<HTMLElement | null>(null);
  const leftAnchorRef = useRef<HTMLSpanElement | null>(null);
  const analysisAnchorRef = useRef<HTMLSpanElement | null>(null);
  const contractCardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [selectedHistoryVersionId, setSelectedHistoryVersionId] = useState<string | null>(null);
  const [zoomedCardId, setZoomedCardId] = useState<string | null>(null);
  const [cameraTransform, setCameraTransform] = useState<{ tx: number; ty: number; scale: number } | null>(null);
  const currentHistoryVersionId = contractHistory?.currentVersionId ?? null;

  const historyVersions = [...(contractHistory?.versions ?? [])].sort(
    (a, b) => Number(a.isCurrent) - Number(b.isCurrent) || a.order - b.order,
  );
  const selectedHistoryVersion =
    historyVersions.find((version) => version.id === selectedHistoryVersionId) ??
    historyVersions.find((version) => version.isCurrent) ??
    historyVersions[historyVersions.length - 1] ??
    null;

  useEffect(() => {
    setSelectedHistoryVersionId(currentHistoryVersionId);
  }, [currentHistoryVersionId]);

  const contractDetailCards = [
    { label: 'مبلغ قرارداد', value: formatMoneyToman(amountRial), tone: '#ffd88b' },
    { label: 'تاریخ قرارداد', value: contractDate, tone: '#79ffe8' },
    { label: 'شماره قرارداد', value: contractNumber, tone: '#a989ff' },
    { label: 'طرف دوم', value: buyerName, tone: '#ff8bbd' },
    { label: 'بلوک', value: blockName, tone: '#5dffc7' },
    { label: 'طبقه', value: floorName, tone: '#e9fff8' },
    { label: 'واحد', value: unitLabel, tone: '#ffcf8a' },
  ];

  const financialOverview = {
    settlementStatus: 'دارای معوقه',
    settlementStatusNote: 'فقط سررسیدهای تاییدشده در در محاسبه این وضعیت لحاظ می‌شوند.',
    dueAmount: '300,000,000 ریال',
    dueAmountNote: 'بدهی سررسیدنشده از معوقه جدا شده است.',
    remainingAmount: '450,000,000 ریال',
    remainingAmountNote: 'فقط بخش سررسید گذشته در این عدد می‌آید.',
    futureDebt: '0 ریال',
    futureDebtNote: 'این مبلغ در تسویه قطعی حساب نمی‌شود.',
    pendingReview: '0 ریال',
    pendingReviewNote: 'این مبلغ در تسویه قطعی حساب نمی‌شود.',
    overdueBalance: '12,270,000 ریال',
    overdueBalanceNote: 'جریمه با اصل بدهی قاطی نشده است.',
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;

      document.querySelectorAll<HTMLElement>('.modern-glass-panel:not(.modern-node-card)').forEach((el, index) => {
        if (index > 7) return;
        el.style.transform = `translate3d(${x * (index % 3 + 1) * 2}px, ${y * (index % 4 + 1) * 2}px, 0)`;
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = GRAPH_COLORS;
    const financialItems: Array<[string, string]> = [
      ['تعدیل', 'محاسبه شاخص'],
      ['اصل قرارداد', 'پیش‌پرداخت + اقساط'],
      ['وام', 'بانک / شرکت'],
      ['سایر هزینه‌ای', 'انشعابات'],
    ];

    const nodes: Array<{
      x: number;
      y: number;
      r: number;
      c: string;
      core?: boolean;
      speed: number;
      phase: number;
      label?: string;
      sub?: string;
      dx?: number;
      dy?: number;
    }> = [];

    let width = 0;
    let height = 0;
    let dpr = 1;
    let t = 0;
    let raf = 0;

    const hexToRgba = (hex: string, alpha: number) => {
      const value = hex.replace('#', '');
      const red = Number.parseInt(value.slice(0, 2), 16);
      const green = Number.parseInt(value.slice(2, 4), 16);
      const blue = Number.parseInt(value.slice(4, 6), 16);
      return `rgba(${red},${green},${blue},${alpha})`;
    };

    const buildGraph = () => {
      nodes.length = 0;
      const cx = width * 0.5;
      const cy = height * 0.43;

      nodes.push({ x: cx, y: cy, r: 18, c: '#ffd88b', core: true, speed: 0, phase: 0, label: 'Contract', sub: 'core' });

      const total = 4;
      for (let i = 0; i < total; i += 1) {
        const angles = [-1.95, -0.18, 1.58, 2.65];
        const distances = [220, 204, 210, 232];
        const angle = angles[i];
        const dist = distances[i];
        const sidePull = Math.sin(angle * 2.3) * 18;

        nodes.push({
          x: cx + Math.cos(angle) * dist + sidePull,
          y: cy + Math.sin(angle) * dist * 0.67 + Math.cos(angle) * 18,
          r: 7 + (i % 2 ? 2 : 0),
          c: colors[i % colors.length],
          speed: 0.25 + Math.random() * 0.25,
          phase: Math.random() * 10,
          label: financialItems[i % financialItems.length][0],
          sub: financialItems[i % financialItems.length][1],
        });
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGraph();
    };

    const focusNode = (node: (typeof nodes)[number]) => {
      if (node.core) return;
      const point = getNodePoint(node);
      const scale = 1.56;
      const tx = width * 0.5 - point.x * scale;
      const ty = height * 0.5 - point.y * scale;
      setCameraTransform({ tx, ty, scale });
    };

    const zoomableLabels = new Set(['تعدیل', 'اصل قرارداد', 'وام', 'سایر هزینه‌ای']);

    const handleCanvasPointerDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      for (let i = nodes.length - 1; i >= 1; i -= 1) {
        const node = nodes[i];
        if (!node.label || !zoomableLabels.has(node.label)) continue;
        const point = getNodePoint(node);
        const cardWidth = 142;
        const cardHeight = 50;
        const cardX = point.x - cardWidth / 2;
        const cardY = point.y - cardHeight / 2;
        const withinCard = x >= cardX && x <= cardX + cardWidth && y >= cardY && y <= cardY + cardHeight;
        if (withinCard) {
          focusNode(node);
          return;
        }
      }

      setCameraTransform(null);
    };

    canvas.addEventListener('pointerdown', handleCanvasPointerDown);

    const getNodePoint = (node: (typeof nodes)[number]) => {
      const x = node.x + (node.core ? 0 : Math.sin(t * 0.0007 + node.phase) * 7);
      const y = node.y + (node.core ? 0 : Math.cos(t * 0.0008 + node.phase) * 5);
      return { x, y };
    };

    const drawCoreBar = (coreNode: (typeof nodes)[number], targetNode: (typeof nodes)[number], color: string, index: number) => {
      const core = getNodePoint(coreNode);
      const target = {
        x: targetNode.dx ?? targetNode.x,
        y: targetNode.dy ?? targetNode.y,
      };
      const dx = target.x - core.x;
      const dy = target.y - core.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const startTrim = 42;
      const endTrim = 6;
      const startX = core.x + (dx / distance) * startTrim;
      const startY = core.y + (dy / distance) * startTrim;
      const endX = target.x - (dx / distance) * endTrim;
      const endY = target.y - (dy / distance) * endTrim;
      const curve = Math.sin(t * 0.001 + index * 1.3) * 16;
      const midX = (startX + endX) / 2 + (dy / distance) * curve;
      const midY = (startY + endY) / 2 - (dx / distance) * curve;
      const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, hexToRgba(color, 0.04));
      gradient.addColorStop(0.5, hexToRgba(color, 0.3));
      gradient.addColorStop(1, hexToRgba(color, 0.06));

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.shadowColor = color;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();
      ctx.restore();
    };

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    const drawNode = (node: (typeof nodes)[number], index: number) => {
      const pulse = Math.sin(t * 0.003 * node.speed + node.phase) * 0.5 + 0.5;
      const { x, y } = getNodePoint(node);
      const radius = node.r + pulse * (node.core ? 5 : 2);

      if (!node.core) {
        const cardWidth = 142;
        const cardHeight = 50;
        const cardX = x - cardWidth / 2;
        const cardY = y - cardHeight / 2;
        const cardFill = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
        cardFill.addColorStop(0, 'rgba(11, 26, 24, 0.94)');
        cardFill.addColorStop(1, 'rgba(6, 15, 14, 0.92)');

        ctx.save();
        roundRect(cardX, cardY, cardWidth, cardHeight, 14);
        ctx.fillStyle = cardFill;
        ctx.fill();
        ctx.strokeStyle = hexToRgba(node.c, 0.16);
        ctx.lineWidth = 0.8;
        ctx.stroke();

        const badgeX = cardX + 11;
        const badgeY = cardY + 15;
        node.dx = badgeX;
        node.dy = badgeY;
        ctx.fillStyle = node.c;
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, 2.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.textAlign = 'right';
        ctx.direction = 'rtl';
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 11px Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial, sans-serif';
        ctx.fillText(node.label || '', cardX + cardWidth - 12, cardY + 21);
        ctx.fillStyle = 'rgba(222,255,246,0.56)';
        ctx.font = '500 9px Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial, sans-serif';
        ctx.fillText(node.sub || '', cardX + cardWidth - 12, cardY + 37);
        ctx.restore();
        return;
      }

      ctx.save();
      ctx.shadowColor = node.c;
      ctx.shadowBlur = node.core ? 52 : 24;
      const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 1, x, y, radius * 2.3);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.18, node.c);
      gradient.addColorStop(0.65, hexToRgba(node.c, 0.38));
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = hexToRgba(node.c, 0.35);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.6 + pulse * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (index > 0) {
        node.dx = x;
        node.dy = y;
      }
    };

    const draw = (time: number) => {
      t = time;
      ctx.clearRect(0, 0, width, height);

      const core = nodes[0];
      const stageRect = canvas.getBoundingClientRect();
      const corePoint = core ? getNodePoint(core) : null;

      const getTargetPoint = (element: HTMLElement | null, side: 'left' | 'right') => {
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        const edgeInset = 1;
        return {
          x: (side === 'left' ? rect.right - edgeInset : rect.left + edgeInset) - stageRect.left,
          y: rect.top - stageRect.top + 28,
        };
      };

      const drawPanelConnector = (target: { x: number; y: number } | null, color: string, curveSign: number) => {
        if (!corePoint || !target) return;
        const dx = target.x - corePoint.x;
        const dy = target.y - corePoint.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const startTrim = 42;
        const endTrim = 0;
        const startX = corePoint.x + (dx / distance) * startTrim;
        const startY = corePoint.y + (dy / distance) * startTrim;
        const endX = target.x - (dx / distance) * endTrim;
        const endY = target.y - (dy / distance) * endTrim;
        const curve = Math.sin(t * 0.0011 + curveSign) * 14;
        const midX = (startX + endX) / 2 + (dy / distance) * curve;
        const midY = (startY + endY) / 2 - (dx / distance) * curve;
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, hexToRgba(color, 0.04));
        gradient.addColorStop(0.5, hexToRgba(color, 0.28));
        gradient.addColorStop(1, hexToRgba(color, 0.06));

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(midX, midY, endX, endY);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(target.x, target.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      nodes.forEach((node, index) => drawNode(node, index));

      if (core) {
        for (let i = 1; i < nodes.length; i += 1) {
          const node = nodes[i];
          drawCoreBar(core, node, node.c, i);
        }
      }

      const activeInfoLabel = zoomedCardId?.startsWith('info:')
        ? zoomedCardId.slice('info:'.length)
        : contractDetailCards[0]?.label ?? null;
      const activeInfoIndex = activeInfoLabel
        ? contractDetailCards.findIndex((card) => card.label === activeInfoLabel)
        : -1;
      const activeInfoCard =
        activeInfoIndex >= 0
          ? contractCardRefs.current[activeInfoIndex]
          : (leftAnchorRef.current?.parentElement as HTMLElement | null) ?? leftCardRef.current;

      drawPanelConnector(getTargetPoint(activeInfoCard, 'left'), '#79ffe8', 2.7);
      drawPanelConnector(
        getTargetPoint((analysisAnchorRef.current?.parentElement as HTMLElement | null) ?? analysisCardRef.current, 'right'),
        '#ffd88b',
        4.1,
      );

      nodes.forEach((node) => {
        if (node.core || node.dx == null || node.dy == null) return;
        ctx.save();
        ctx.fillStyle = node.c;
        ctx.beginPath();
        ctx.arc(node.dx, node.dy, 2.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      const vignette = ctx.createRadialGradient(width * 0.52, height * 0.43, 80, width * 0.52, height * 0.43, Math.max(width, height) * 0.68);
      vignette.addColorStop(0, 'rgba(130,255,230,.04)');
      vignette.addColorStop(0.55, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,.72)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      raf = window.requestAnimationFrame(draw);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    raf = window.requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
      canvas.removeEventListener('pointerdown', handleCanvasPointerDown);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  const statusTone =
    contractStatusLabel.includes('تایید')
      ? 'text-amber-200'
      : contractStatusLabel.includes('تکمیل')
        ? 'text-emerald-200'
        : 'text-cyan-200';

  return (
    <section
      dir="rtl"
      lang="fa"
      className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[30px] border border-[rgba(171,255,230,0.16)] bg-[linear-gradient(130deg,#020403_0%,#061210_42%,#010302_100%)] px-3 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]"
      aria-label="گراف دانش مالی قرارداد"
    >
      <div className="modern-aurora modern-aurora-a" aria-hidden />
      <div className="modern-aurora modern-aurora-b" aria-hidden />
      <div className="modern-noise" aria-hidden />

      <main className="modern-stage mt-4 flex-1">
        <div
          className="modern-stage-scene"
          style={
            cameraTransform
              ? {
                  transform: `translate(${cameraTransform.tx}px, ${cameraTransform.ty}px) scale(${cameraTransform.scale})`,
                }
              : undefined
          }
        >
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

          {historyVersions.length > 1 && (
            <aside className="modern-history-rail modern-glass-panel" aria-label="تاریخچه قرارداد">
              <div className="history-rail-list" role="list" aria-label="نسخه‌های قرارداد">
                {historyVersions.map((version) => {
                  const selected = selectedHistoryVersion?.id === version.id;
                  const versionLabel = getHistoryVersionLabel(version);

                  return (
                    <button
                      key={version.id}
                      type="button"
                      role="listitem"
                      className={`history-rail-item${selected ? ' is-selected' : ''}`}
                      onClick={() => setSelectedHistoryVersionId(version.id)}
                    >
                      <span className="history-rail-label">{versionLabel}</span>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}

          <section className="modern-hero-node" aria-label="مرکز گراف">
            <div className="modern-hero-core" aria-hidden />
            <div className="modern-hero-rings" aria-hidden />
          </section>

          <div className="modern-left-shell">
            <aside ref={leftCardRef} className="modern-left-card modern-glass-panel">
              <span ref={leftAnchorRef} className="panel-connector-anchor panel-connector-anchor-left" aria-hidden />
              <div className="mb-4">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200">Contract</div>
              <h3 className="mt-2 text-[22px] font-black text-white">اطلاعات قرارداد</h3>
              <p className="mt-2 text-[13px] leading-8 text-white/68">
                این بخش اطلاعات اصلی قرارداد را به صورت کارت‌های زیر هم نمایش می‌دهد.
              </p>
            </div>

              <div className="contract-cards">
                {contractDetailCards.map((card) => (
                  <button
                    key={card.label}
                    ref={(element) => {
                      contractCardRefs.current[contractDetailCards.findIndex((item) => item.label === card.label)] = element;
                    }}
                    type="button"
                    className={`contract-card${zoomedCardId === `info:${card.label}` ? ' is-zoomed' : ''}`}
                    onClick={() => setZoomedCardId(`info:${card.label}`)}
                    aria-pressed={zoomedCardId === `info:${card.label}`}
                  >
                    <div className="contract-card-label">
                      <span className="contract-card-dot" aria-hidden style={{ background: card.tone }} />
                      <strong>{card.label}</strong>
                    </div>
                    <b className="contract-card-value" style={{ color: card.tone }}>
                      {card.value}
                    </b>
                  </button>
                ))}
              </div>
            </aside>
          </div>

          <div className="modern-analysis-shell">
            <aside ref={analysisCardRef} className="modern-analysis-panel modern-glass-panel">
              <span
                ref={analysisAnchorRef}
                className="panel-connector-anchor panel-connector-anchor-right"
                aria-hidden
              />
              <div className="panel-head">
              <span className="modern-panel-icon" aria-hidden>
                ✦
              </span>
              <div>
                <small>AI Analysis</small>
                <strong>وضعیت مالی قرارداد</strong>
                <div className={`mt-1 text-[12px] font-black ${statusTone}`}>{contractStatusLabel}</div>
              </div>
              <button type="button" aria-label="گزینه‌های بیشتر">
                •••
              </button>
              </div>

              <div className="risk-card">
                <div>
                  <small>وضعیت تسویه</small>
                  <strong>{financialOverview.settlementStatus}</strong>
                  <p>{financialOverview.settlementStatusNote}</p>
                </div>
                <div className="spark" aria-hidden>
                  {[14, 27, 22, 38, 29, 42, 19].map((bar, index) => (
                    <i key={`${bar}-${index}`} style={{ height: `${bar}px`, animationDelay: `${index * 90}ms` }} />
                  ))}
                </div>
              </div>

              <div className="stats-grid">
                <button
                  type="button"
                  className={`zoom-stat-card${zoomedCardId === 'financial:futureDebt' ? ' is-zoomed' : ''}`}
                  onClick={() => setZoomedCardId('financial:futureDebt')}
                  aria-pressed={zoomedCardId === 'financial:futureDebt'}
                >
                  <span>بدهی آینده</span>
                  <b>{financialOverview.futureDebt}</b>
                  <small>{financialOverview.futureDebtNote}</small>
                </button>
                <button
                  type="button"
                  className={`zoom-stat-card${zoomedCardId === 'financial:dueAmount' ? ' is-zoomed' : ''}`}
                  onClick={() => setZoomedCardId('financial:dueAmount')}
                  aria-pressed={zoomedCardId === 'financial:dueAmount'}
                >
                  <span>بدهی قسطی</span>
                  <b>{financialOverview.dueAmount}</b>
                  <small>{financialOverview.dueAmountNote}</small>
                </button>
                <button
                  type="button"
                  className={`zoom-stat-card${zoomedCardId === 'financial:pendingReview' ? ' is-zoomed' : ''}`}
                  onClick={() => setZoomedCardId('financial:pendingReview')}
                  aria-pressed={zoomedCardId === 'financial:pendingReview'}
                >
                  <span>رسید در انتظار بررسی</span>
                  <b>{financialOverview.pendingReview}</b>
                  <small>{financialOverview.pendingReviewNote}</small>
                </button>
                <button
                  type="button"
                  className={`zoom-stat-card${zoomedCardId === 'financial:overdueBalance' ? ' is-zoomed' : ''}`}
                  onClick={() => setZoomedCardId('financial:overdueBalance')}
                  aria-pressed={zoomedCardId === 'financial:overdueBalance'}
                >
                  <span>معوقه</span>
                  <b>{financialOverview.overdueBalance}</b>
                  <small>{financialOverview.overdueBalanceNote}</small>
                </button>
              </div>

              <div className="insight">
                <span>AI Suggestion</span>
                <p>{financialOverview.remainingAmountNote}</p>
              </div>
            </aside>
          </div>
        </div>

      </main>

      <style jsx>{`
        .modern-noise {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.13;
          mix-blend-mode: screen;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E");
        }

        .modern-aurora {
          position: absolute;
          border-radius: 9999px;
          filter: blur(72px);
          opacity: 0.33;
          pointer-events: none;
          mix-blend-mode: screen;
        }

        .modern-aurora-a {
          width: 34vw;
          height: 34vw;
          background: rgba(49, 255, 209, 0.68);
          left: 12vw;
          top: 8vh;
          animation: modernFloat 10s ease-in-out infinite;
        }

        .modern-aurora-b {
          width: 28vw;
          height: 28vw;
          background: rgba(140, 108, 255, 0.6);
          right: 12vw;
          bottom: 8vh;
          animation: modernFloat 12s ease-in-out infinite reverse;
        }

        .modern-glass-panel {
          border-radius: 28px;
          border: 1px solid rgba(203, 255, 241, 0.12);
          background: linear-gradient(160deg, rgba(17, 43, 39, 0.74), rgba(4, 12, 12, 0.54));
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(24px) saturate(150%);
          -webkit-backdrop-filter: blur(24px) saturate(150%);
        }

        .modern-stage {
          position: relative;
          flex: 1 1 auto;
          min-height: 0;
          overflow: hidden;
          border-radius: 28px;
          border: 1px solid rgba(203, 255, 241, 0.12);
          background: rgba(0, 0, 0, 0.28);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          perspective: 1200px;
        }

        .modern-stage-scene {
          position: absolute;
          inset: 0;
          transform-origin: 0 0;
          transition: transform 760ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }

        .modern-history-rail {
          position: absolute;
          left: 28px;
          top: 160px;
          z-index: 20;
          width: 66px;
          padding: 12px 10px;
          display: grid;
          gap: 12px;
          direction: rtl;
          justify-items: center;
        }

        .history-rail-list {
          width: 100%;
          display: grid;
          gap: 10px;
        }

        .history-rail-item {
          width: 100%;
          min-height: 32px;
          border: 0;
          border-radius: 999px;
          padding: 7px 6px;
          display: grid;
          place-items: center;
          background: rgba(0, 0, 0, 0.16);
          color: rgba(229, 255, 248, 0.42);
          cursor: pointer;
          box-shadow: inset 0 0 0 1px rgba(125, 255, 235, 0.08);
          transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
        }

        .history-rail-item:hover {
          transform: translateX(-1px);
          background: rgba(13, 38, 35, 0.88);
          color: white;
        }

        .history-rail-item.is-selected {
          background: rgba(118, 255, 229, 0.14);
          color: white;
          box-shadow: inset 0 0 0 1px rgba(118, 255, 229, 0.2), 0 0 0 1px rgba(118, 255, 229, 0.1);
        }

        .history-rail-label {
          display: block;
          max-width: 100%;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        }

        .history-rail-empty {
          min-height: 32px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: rgba(222, 255, 246, 0.6);
          background: rgba(0, 0, 0, 0.14);
        }

        .modern-hero-node {
          position: absolute;
          left: 49%;
          top: 43%;
          width: 178px;
          height: 178px;
          translate: -50% -50%;
          z-index: 7;
          display: grid;
          place-items: center;
          animation: modernHeroDrift 14s ease-in-out infinite;
        }

        .modern-hero-core {
          position: absolute;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: radial-gradient(circle, #fff 0 9%, #fff0c9 13%, #ffd98b 38%, rgba(255, 216, 139, 0.25) 65%, transparent 72%);
          box-shadow: 0 0 30px #ffe6ad, 0 0 100px rgba(255, 216, 139, 0.55);
          animation: modernPulse 3.5s ease-in-out infinite;
        }

        .modern-hero-rings,
        .modern-hero-rings::before,
        .modern-hero-rings::after {
          position: absolute;
          content: '';
          border-radius: 50%;
          inset: 18px;
          border: 1px solid rgba(255, 230, 180, 0.22);
          box-shadow: 0 0 35px rgba(255, 216, 139, 0.15);
        }

        .modern-hero-rings::before {
          inset: -14px;
          border-style: dashed;
          animation: modernSpin 22s linear infinite;
        }

        .modern-hero-rings::after {
          inset: 32px;
          border-color: rgba(255, 255, 255, 0.14);
          animation: modernSpin 13s linear infinite reverse;
        }

        .modern-hero-copy {
          position: absolute;
          left: 110px;
          top: 64px;
          white-space: nowrap;
          text-shadow: 0 0 20px #000;
          direction: ltr;
        }

        .modern-hero-copy span {
          display: block;
          color: rgba(222, 255, 246, 0.62);
          font-size: 11px;
        }

        .modern-hero-copy strong {
          font-size: 19px;
          font-weight: 700;
          color: #ffffff;
        }

        .modern-node-card {
          position: absolute;
          z-index: 18;
          min-width: 122px;
          padding: 9px 10px 9px 28px;
          border-radius: 16px;
          transform: translate(-50%, -50%);
          direction: ltr;
          will-change: transform, filter;
        }

        .modern-node-card strong {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: white;
        }

        .modern-node-card small {
          display: block;
          color: rgba(222, 255, 246, 0.54);
          font-size: 9px;
        }

        .modern-node-card-dot {
          position: absolute;
          left: 10px;
          top: 13px;
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: var(--cyan);
        }

        .modern-left-card {
          position: absolute;
          left: 3%;
          bottom: 20%;
          width: 330px;
          padding: 20px;
          direction: rtl;
          overflow: visible;
          animation: modernPanelIn 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .modern-analysis-panel {
          position: absolute;
          right: 9%;
          top: 25%;
          width: 356px;
          padding: 16px;
          direction: rtl;
          overflow: visible;
          animation: modernPanelIn 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .modern-left-shell,
        .modern-analysis-shell {
          position: absolute;
          z-index: 20;
        }

        .modern-left-shell {
          left: 3%;
          bottom: 20%;
          width: 330px;
          height: auto;
        }

        .modern-analysis-shell {
          right: 9%;
          top: 25%;
          width: 356px;
          height: auto;
          z-index: 22;
        }

        .panel-connector-anchor {
          position: absolute;
          top: 28px;
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          pointer-events: none;
          z-index: 2;
          box-shadow: 0 0 0 4px rgba(121, 255, 232, 0.07), 0 0 18px currentColor;
          transform: translateY(-50%);
        }

        .panel-connector-anchor-left {
          right: -5px;
          background: #79ffe8;
          color: #79ffe8;
        }

        .panel-connector-anchor-right {
          left: -5px;
          background: #ffd88b;
          color: #ffd88b;
          box-shadow: 0 0 0 4px rgba(255, 216, 139, 0.07), 0 0 18px currentColor;
        }

        .modern-left-shell .modern-left-card,
        .modern-analysis-shell .modern-analysis-panel {
          position: relative;
          inset: auto;
          width: 100%;
        }

        .contract-cards {
          display: grid;
          gap: 0;
          overflow: hidden;
          border-radius: 22px;
          border: 1px solid rgba(180, 255, 240, 0.08);
          background: rgba(180, 255, 240, 0.03);
        }

        .contract-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-radius: 0;
          padding: 14px 16px;
          background: transparent;
          border: 0;
          border-bottom: 1px solid rgba(180, 255, 240, 0.08);
          width: 100%;
          text-align: right;
          cursor: pointer;
          transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease, border-color 180ms ease;
          transform-origin: right center;
          position: relative;
          z-index: 0;
          appearance: none;
          font: inherit;
        }

        .contract-card:last-child {
          border-bottom: 0;
        }

        .contract-card:hover {
          background: rgba(180, 255, 240, 0.035);
        }

        .contract-card.is-zoomed {
          transform-origin: right center;
          transform: scale(1.045);
          z-index: 3;
          background: rgba(180, 255, 240, 0.06);
          box-shadow: 0 18px 35px rgba(0, 0, 0, 0.22);
          border-bottom-color: rgba(180, 255, 240, 0.16);
        }

        .contract-card-label {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .contract-card-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          flex: none;
        }

        .contract-card-label strong {
          display: block;
          color: white;
          font-size: 12px;
          font-weight: 700;
        }

        .contract-card-value {
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .modern-left-card p {
          margin: 0;
        }

        .panel-head {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .panel-head small {
          display: block;
          color: rgba(125, 255, 235, 0.7);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .panel-head strong {
          font-size: 14px;
          color: white;
        }

        .panel-head button {
          margin-right: auto;
          width: 30px;
          height: 30px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.18);
          color: white;
        }

        .modern-panel-icon {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(125, 255, 235, 0.16), rgba(171, 137, 255, 0.12));
          box-shadow: none;
          color: white;
        }

        .risk-card {
          margin-top: 16px;
          border-radius: 18px;
          padding: 14px 15px;
          background: rgba(255, 94, 146, 0.08);
          border: 1px solid rgba(255, 94, 146, 0.16);
          box-shadow: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .risk-card small {
          display: block;
          color: rgba(255, 224, 232, 0.72);
          font-size: 11px;
        }

        .risk-card strong {
          display: block;
          font-size: 28px;
          color: white;
        }

        .risk-card p {
          margin-top: 6px;
          color: rgba(255, 224, 232, 0.76);
          font-size: 11px;
          line-height: 1.7;
        }

        .spark {
          height: 38px;
          display: flex;
          align-items: end;
          gap: 3px;
        }

        .spark i {
          width: 5px;
          border-radius: 8px;
          background: linear-gradient(to top, var(--pink), rgba(255, 255, 255, 0.8));
          animation: modernBar 1.2s ease-in-out infinite;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-top: 10px;
        }

        .stats-grid article {
          border-radius: 16px;
          padding: 12px 12px 11px;
          background: rgba(180, 255, 240, 0.045);
          border: 1px solid rgba(180, 255, 240, 0.07);
          text-align: center;
        }

        .zoom-stat-card {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
          border-radius: 16px;
          padding: 12px 12px 11px;
          background: rgba(180, 255, 240, 0.045);
          border: 1px solid rgba(180, 255, 240, 0.07);
          text-align: center;
          width: 100%;
          cursor: pointer;
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
          transform-origin: left center;
          position: relative;
          z-index: 0;
          appearance: none;
          font: inherit;
        }

        .zoom-stat-card:hover {
          background: rgba(180, 255, 240, 0.06);
        }

        .zoom-stat-card.is-zoomed {
          transform-origin: left center;
          transform: scale(1.06);
          z-index: 3;
          border-color: rgba(125, 255, 235, 0.18);
          background: rgba(180, 255, 240, 0.075);
          box-shadow: 0 18px 35px rgba(0, 0, 0, 0.22);
        }

        .stats-grid span,
        .stats-grid small {
          display: block;
          color: rgba(222, 255, 246, 0.56);
          font-size: 10px;
        }

        .stats-grid b {
          display: block;
          font-size: 22px;
          color: white;
          overflow-wrap: anywhere;
        }

        .insight {
          margin-top: 10px;
          border-radius: 16px;
          padding: 12px 13px;
          background: rgba(180, 255, 240, 0.045);
          border: 1px solid rgba(180, 255, 240, 0.07);
        }

        .insight span {
          display: block;
          color: rgba(255, 216, 139, 0.9);
          font-size: 11px;
          font-weight: 800;
        }

        .insight p {
          margin-top: 6px;
          color: rgba(222, 255, 246, 0.66);
          font-size: 11px;
          line-height: 1.7;
        }

        @media (max-width: 980px) {
          .modern-analysis-panel {
            right: 24px;
            width: 310px;
          }

          .modern-left-card {
            left: 24px;
            width: 300px;
          }
        }

        @media (max-width: 720px) {
          .modern-stage {
            padding-bottom: 108px;
          }

          .modern-history-rail,
          .modern-left-card {
            display: none;
          }

          .modern-analysis-panel {
            right: 14px;
            left: 14px;
            top: auto;
            bottom: 128px;
            width: auto;
          }
          .modern-hero-node {
            left: 50%;
            top: 35%;
            width: 140px;
            height: 140px;
          }

          .modern-hero-copy {
            left: 82px;
            top: 50px;
          }

          .modern-hero-copy strong {
            font-size: 16px;
          }
        }

        @keyframes modernFloat {
          50% {
            transform: translate3d(4vw, -4vh, 0) scale(1.05);
          }
        }

        @keyframes modernPulse {
          50% {
            transform: scale(1.08);
            filter: saturate(1.35);
          }
        }

        @keyframes modernSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes modernPulseDot {
          50% {
            transform: scale(1.7);
            opacity: 0.45;
          }
        }

        @keyframes modernBar {
          50% {
            transform: scaleY(0.55);
            opacity: 0.75;
          }
        }

        @keyframes modernPanelIn {
          from {
            opacity: 0;
            transform: translateY(28px) scale(0.96);
            filter: blur(10px);
          }

          to {
            opacity: 1;
            transform: none;
            filter: none;
          }
        }

        @keyframes modernCardPop {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.72);
            filter: blur(8px);
          }

          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
            filter: none;
          }
        }

        @keyframes modernCardFloat {
          0%,
          100% {
            transform: translate(-50%, -50%) translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate(-50%, -50%) translate3d(0, -12px, 0) scale(1.03);
          }
        }

        @keyframes modernHeroDrift {
          50% {
            transform: translate3d(18px, -14px, 0) scale(1.04);
          }
        }
      `}</style>
    </section>
  );
}

