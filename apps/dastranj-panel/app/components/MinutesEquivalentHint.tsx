'use client';

import { formatMinutesLabel } from '../lib/attendance-format';

export function parseMinutesInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function MinutesEquivalentHint({
  minutes,
  className = 'minutes-equivalent-hint',
}: {
  minutes: number | null | undefined;
  className?: string;
}) {
  if (minutes == null || !Number.isFinite(minutes) || minutes < 0) return null;
  return <p className={className}>معادل {formatMinutesLabel(minutes)}</p>;
}
