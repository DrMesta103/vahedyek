import type { MilestoneTerminationConfig, PhysicalProgressMilestoneType } from '../types/contract';

export interface MilestoneEligibilityInput {
  milestoneType: PhysicalProgressMilestoneType;
  config: MilestoneTerminationConfig;
  targetDeadline: string | Date;
  achievedAt?: string | Date | null;
}

export interface TerminationEligibilityResult {
  terminationRightAvailable: boolean;
  breachedMilestones: PhysicalProgressMilestoneType[];
}

function toDate(value: string | Date): Date {
  return value instanceof Date ? new Date(value.getTime()) : new Date(value);
}

function isValidDate(value: Date) {
  return Number.isFinite(value.getTime());
}

/**
 * Mock evaluation helper.
 * In the real flow, the target deadline is computed from the selected milestone
 * configuration and the contract's progress evidence source.
 */
export function checkTerminationEligibility(
  milestones: MilestoneEligibilityInput[],
  referenceDate: Date = new Date(),
): TerminationEligibilityResult {
  const breachedMilestones: PhysicalProgressMilestoneType[] = [];

  for (const milestone of milestones) {
    const target = toDate(milestone.targetDeadline);
    if (!isValidDate(target)) continue;

    const graceDays =
      milestone.config.gracePreset === 'other'
        ? Number.parseInt(milestone.config.graceDaysCustom || '0', 10)
        : Number(milestone.config.gracePreset);

    if (!Number.isFinite(graceDays) || graceDays < 0) continue;

    const deadline = new Date(target);
    deadline.setDate(deadline.getDate() + graceDays);

    const achievedAt = milestone.achievedAt ? toDate(milestone.achievedAt) : null;
    const achievedLate = achievedAt ? achievedAt > deadline : referenceDate > deadline;

    if (achievedLate) {
      breachedMilestones.push(milestone.milestoneType);
    }
  }

  return {
    terminationRightAvailable: breachedMilestones.length > 0,
    breachedMilestones,
  };
}

export function buildMilestoneTerminationConfig(
  milestoneType: PhysicalProgressMilestoneType,
  config: MilestoneTerminationConfig,
): MilestoneTerminationConfig {
  return {
    milestoneType,
    timelinePreset: config.timelinePreset,
    timelineMonthsCustom: config.timelineMonthsCustom,
    timelineSpecificDate: config.timelineSpecificDate,
    gracePreset: config.gracePreset,
    graceDaysCustom: config.graceDaysCustom,
  };
}
