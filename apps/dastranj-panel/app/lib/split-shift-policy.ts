export type SplitShiftCalculationMode = 'lenient' | 'strict';

export type SplitShiftSegmentRules = {
  id: string;
  title: string;
  startTime?: string | null;
  endTime?: string | null;
  entryGraceMinutes: number;
  delayCalculationMode: SplitShiftCalculationMode;
  maxDelayBeforeAbsenceMinutes: number;
  exitGraceMinutes: number;
  earlyLeaveCalculationMode: SplitShiftCalculationMode;
};

const DEFAULT_SEGMENT_TITLES = ['بخش اول', 'بخش دوم'] as const;

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function modeValue(value: unknown, fallback: SplitShiftCalculationMode = 'lenient'): SplitShiftCalculationMode {
  return value === 'strict' ? 'strict' : fallback;
}

function parseTimeToMinutes(value?: string | null) {
  if (!value) return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
}

export function defaultSplitShiftSegmentRules(globalDefaults: {
  entryGraceMinutes: number;
  exitGraceMinutes: number;
  maxDelayMinutes: number;
  delayCalculationMode: SplitShiftCalculationMode;
  earlyLeaveCalculationMode: SplitShiftCalculationMode;
  startTime?: string;
  endTime?: string;
  workStartWindow?: string;
  workEndWindow?: string;
}): SplitShiftSegmentRules[] {
  return [
    {
      id: 'segment-1',
      title: DEFAULT_SEGMENT_TITLES[0],
      startTime: globalDefaults.startTime || '08:00',
      endTime: globalDefaults.endTime || '12:00',
      entryGraceMinutes: globalDefaults.entryGraceMinutes,
      delayCalculationMode: globalDefaults.delayCalculationMode,
      maxDelayBeforeAbsenceMinutes: globalDefaults.maxDelayMinutes,
      exitGraceMinutes: globalDefaults.exitGraceMinutes,
      earlyLeaveCalculationMode: globalDefaults.earlyLeaveCalculationMode,
    },
    {
      id: 'segment-2',
      title: DEFAULT_SEGMENT_TITLES[1],
      startTime: globalDefaults.workStartWindow || '14:00',
      endTime: globalDefaults.workEndWindow || '18:00',
      entryGraceMinutes: globalDefaults.entryGraceMinutes,
      delayCalculationMode: globalDefaults.delayCalculationMode,
      maxDelayBeforeAbsenceMinutes: globalDefaults.maxDelayMinutes,
      exitGraceMinutes: globalDefaults.exitGraceMinutes,
      earlyLeaveCalculationMode: globalDefaults.earlyLeaveCalculationMode,
    },
  ];
}

export function parseSplitShiftSegmentRules(sectionValues: Record<string, unknown>): SplitShiftSegmentRules[] {
  const globalDefaults = {
    entryGraceMinutes: numberValue(sectionValues.entryGraceMinutes, 0),
    exitGraceMinutes: numberValue(sectionValues.exitGraceMinutes, 0),
    maxDelayMinutes: numberValue(sectionValues.maxDelayMinutes, 0),
    delayCalculationMode: modeValue(sectionValues.delayCalculationMode),
    earlyLeaveCalculationMode: modeValue(sectionValues.earlyLeaveCalculationMode),
    startTime: typeof sectionValues.startTime === 'string' ? sectionValues.startTime : '08:00',
    endTime: typeof sectionValues.endTime === 'string' ? sectionValues.endTime : '12:00',
    workStartWindow: typeof sectionValues.workStartWindow === 'string' ? sectionValues.workStartWindow : '14:00',
    workEndWindow: typeof sectionValues.workEndWindow === 'string' ? sectionValues.workEndWindow : '18:00',
  };

  const splitShift = asObject(sectionValues.splitShift);
  const rawSegments = Array.isArray(splitShift.segments)
    ? splitShift.segments
    : Array.isArray(sectionValues.splitShiftSegments)
      ? sectionValues.splitShiftSegments
      : null;

  if (!rawSegments?.length) {
    return defaultSplitShiftSegmentRules(globalDefaults);
  }

  const fallbackSegments = defaultSplitShiftSegmentRules(globalDefaults);
  return rawSegments.map((item, index) => {
    const segment = asObject(item);
    const fallback = fallbackSegments[index] ?? fallbackSegments[0];
    return {
      id: typeof segment.id === 'string' ? segment.id : fallback.id,
      title: typeof segment.title === 'string' ? segment.title : fallback.title,
      startTime: typeof segment.startTime === 'string' ? segment.startTime : fallback.startTime,
      endTime: typeof segment.endTime === 'string' ? segment.endTime : fallback.endTime,
      entryGraceMinutes: numberValue(segment.entryGraceMinutes, fallback.entryGraceMinutes),
      delayCalculationMode: modeValue(segment.delayCalculationMode, fallback.delayCalculationMode),
      maxDelayBeforeAbsenceMinutes: numberValue(
        segment.maxDelayBeforeAbsenceMinutes ?? segment.maxDelayMinutes,
        fallback.maxDelayBeforeAbsenceMinutes,
      ),
      exitGraceMinutes: numberValue(segment.exitGraceMinutes, fallback.exitGraceMinutes),
      earlyLeaveCalculationMode: modeValue(segment.earlyLeaveCalculationMode, fallback.earlyLeaveCalculationMode),
    } satisfies SplitShiftSegmentRules;
  });
}

export function validateSplitShiftSegmentRules(segments: SplitShiftSegmentRules[]): string[] {
  const errors: string[] = [];
  if (segments.length < 2) {
    errors.push('شیفت دوتکه باید حداقل دو بخش داشته باشد.');
    return errors;
  }

  const windows: Array<{ label: string; start: number; end: number }> = [];
  for (const segment of segments) {
    if (!segment.startTime || !segment.endTime) {
      errors.push(`${segment.title}: ساعت شروع و پایان الزامی است.`);
      continue;
    }
    const start = parseTimeToMinutes(segment.startTime);
    const end = parseTimeToMinutes(segment.endTime);
    if (start == null || end == null) {
      errors.push(`${segment.title}: ساعت شروع یا پایان نامعتبر است.`);
      continue;
    }
    if (end <= start) {
      errors.push(`${segment.title}: ساعت پایان باید بعد از ساعت شروع باشد.`);
      continue;
    }
    windows.push({ label: segment.title, start, end });
  }

  for (let i = 0; i < windows.length; i += 1) {
    for (let j = i + 1; j < windows.length; j += 1) {
      const a = windows[i];
      const b = windows[j];
      const overlap = a.start < b.end && b.start < a.end;
      if (overlap) {
        errors.push(`بازه ${a.label} و ${b.label} نباید هم‌پوشانی داشته باشند.`);
      }
    }
  }

  return errors;
}

export function buildSplitShiftSegmentsPayload(formData: FormData, previousSectionValues: Record<string, unknown>) {
  const existing = parseSplitShiftSegmentRules(previousSectionValues);
  const readSegment = (index: number, prefix: '1' | '2') => {
    const fallback = existing[index] ?? existing[0];
    const value = (key: string) => formData.get(`splitSegment${prefix}${key}`)?.toString() ?? '';
    return {
      id: fallback?.id ?? `segment-${prefix}`,
      title: fallback?.title ?? (prefix === '1' ? DEFAULT_SEGMENT_TITLES[0] : DEFAULT_SEGMENT_TITLES[1]),
      startTime: value('StartTime') || fallback?.startTime || null,
      endTime: value('EndTime') || fallback?.endTime || null,
      entryGraceMinutes: numberValue(value('EntryGraceMinutes'), fallback?.entryGraceMinutes ?? 0),
      delayCalculationMode: modeValue(value('DelayCalculationMode'), fallback?.delayCalculationMode ?? 'lenient'),
      maxDelayBeforeAbsenceMinutes: numberValue(value('MaxDelayBeforeAbsenceMinutes'), fallback?.maxDelayBeforeAbsenceMinutes ?? 0),
      exitGraceMinutes: numberValue(value('ExitGraceMinutes'), fallback?.exitGraceMinutes ?? 0),
      earlyLeaveCalculationMode: modeValue(value('EarlyLeaveCalculationMode'), fallback?.earlyLeaveCalculationMode ?? 'lenient'),
    } satisfies SplitShiftSegmentRules;
  };

  return {
    splitShift: {
      segments: [readSegment(0, '1'), readSegment(1, '2')],
    },
    splitShiftSegments: [readSegment(0, '1'), readSegment(1, '2')],
  };
}
