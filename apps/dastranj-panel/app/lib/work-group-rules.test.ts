import assert from 'node:assert/strict';
import test from 'node:test';
import { completionForWorkGroup, normalizeWorkGroupTitle, planMembershipTransfer, shouldApplyContextChangeNow, validateMembershipDates, validateWorkGroupTitle } from './work-group-rules';

test('normalizes and validates tenant-scoped title keys', () => {
  assert.equal(normalizeWorkGroupTitle('  گروه   فروش '), 'گروه فروش');
  assert.throws(() => validateWorkGroupTitle(' '));
});

test('membership end cannot precede start', () => {
  assert.throws(() => validateMembershipDates(new Date('2026-02-02'), new Date('2026-02-01')));
});

test('transfer ends the old membership and creates a distinct new record plan', () => {
  const effectiveDate = new Date('2026-07-01T12:00:00.000Z');
  const plan = planMembershipTransfer({ currentMembershipId: 'old', employeeId: 'employee', nextWorkGroupId: 'new-group', effectiveDate, reason: 'انتقال عملیاتی' });
  assert.equal(plan.endCurrent?.id, 'old');
  assert.equal(plan.createNext.workGroupId, 'new-group');
});

test('future policy and location changes are history-only until effective date', () => {
  assert.equal(shouldApplyContextChangeNow(new Date('2026-08-01'), new Date('2026-07-01')), false);
  assert.equal(shouldApplyContextChangeNow(new Date('2026-06-01'), new Date('2026-07-01')), true);
});

test('completion reports real missing requirements', () => {
  const result = completionForWorkGroup({ title: 'فروش', locationId: 'loc', policyId: null, activeMembers: 2 });
  assert.equal(result.percent, 75);
  assert.deepEqual(result.requirements.filter((item) => !item.complete).map((item) => item.key), ['policy']);
});
