import assert from 'node:assert/strict';
import test from 'node:test';

import { checkTerminationEligibility } from '../app/lib/physicalProgressTermination';
import type { MilestoneTerminationConfig } from '../app/types/contract';

const config: MilestoneTerminationConfig = {
  timelinePreset: '6',
  timelineMonthsCustom: '',
  timelineSpecificDate: '',
  gracePreset: '30',
  graceDaysCustom: '',
};

test('checkTerminationEligibility flags a breach after target timeline plus grace period', () => {
  const result = checkTerminationEligibility([
    {
      milestoneType: 'progress-30',
      config,
      targetDeadline: '2026-01-01T00:00:00.000Z',
      achievedAt: '2026-02-05T00:00:00.000Z',
    },
  ], new Date('2026-02-10T00:00:00.000Z'));

  assert.equal(result.terminationRightAvailable, true);
  assert.deepEqual(result.breachedMilestones, ['progress-30']);
});

test('checkTerminationEligibility stays inactive before the grace deadline', () => {
  const result = checkTerminationEligibility([
    {
      milestoneType: 'skeleton-complete',
      config,
      targetDeadline: '2026-01-01T00:00:00.000Z',
      achievedAt: '2026-01-20T00:00:00.000Z',
    },
  ], new Date('2026-01-25T00:00:00.000Z'));

  assert.equal(result.terminationRightAvailable, false);
  assert.deepEqual(result.breachedMilestones, []);
});
