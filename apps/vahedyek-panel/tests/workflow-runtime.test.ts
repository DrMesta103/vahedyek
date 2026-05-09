import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canUserApproveStep,
  canUserRejectToDraft,
  canUserRequestRevision,
  isStepApproveComplete,
} from '../app/lib/workflowRuntime';
import type { WorkflowStepDefinition } from '../app/lib/workflowTypes';

const parallelAll: WorkflowStepDefinition = {
  id: 's1',
  title: 'A',
  approvers: ['u1', 'u2', 'u3'],
  type: 'PARALLEL',
  logic: { mode: 'ALL_MUST_APPROVE' },
};

const parallelMin: WorkflowStepDefinition = {
  id: 's2',
  title: 'B',
  approvers: ['a', 'b', 'c'],
  type: 'PARALLEL',
  logic: { mode: 'MINIMUM_COUNT', count: 2 },
};

const sequential: WorkflowStepDefinition = {
  id: 's3',
  title: 'C',
  approvers: ['x', 'y'],
  type: 'SEQUENTIAL',
  logic: { mode: 'ALL_MUST_APPROVE' },
};

test('parallel ALL_MUST_APPROVE completes only when every approver has approved', () => {
  assert.equal(isStepApproveComplete(parallelAll, []), false);
  assert.equal(
    isStepApproveComplete(parallelAll, [
      { stepId: 's1', approverUserId: 'u1', decision: 'APPROVE' },
      { stepId: 's1', approverUserId: 'u2', decision: 'APPROVE' },
    ]),
    false,
  );
  assert.equal(
    isStepApproveComplete(parallelAll, [
      { stepId: 's1', approverUserId: 'u1', decision: 'APPROVE' },
      { stepId: 's1', approverUserId: 'u2', decision: 'APPROVE' },
      { stepId: 's1', approverUserId: 'u3', decision: 'APPROVE' },
    ]),
    true,
  );
});

test('parallel MINIMUM_COUNT completes when distinct approvals reach count', () => {
  assert.equal(isStepApproveComplete(parallelMin, []), false);
  assert.equal(
    isStepApproveComplete(parallelMin, [{ stepId: 's2', approverUserId: 'a', decision: 'APPROVE' }]),
    false,
  );
  assert.equal(
    isStepApproveComplete(parallelMin, [
      { stepId: 's2', approverUserId: 'a', decision: 'APPROVE' },
      { stepId: 's2', approverUserId: 'b', decision: 'APPROVE' },
    ]),
    true,
  );
});

test('sequential completes in approvers order', () => {
  assert.equal(isStepApproveComplete(sequential, []), false);
  assert.equal(
    isStepApproveComplete(sequential, [{ stepId: 's3', approverUserId: 'y', decision: 'APPROVE' }]),
    false,
  );
  assert.equal(
    canUserApproveStep('y', sequential, []),
    false,
  );
  assert.equal(
    canUserApproveStep('x', sequential, []),
    true,
  );
  const d1 = [{ stepId: 's3', approverUserId: 'x', decision: 'APPROVE' as const }];
  assert.equal(isStepApproveComplete(sequential, d1), false);
  assert.equal(canUserApproveStep('y', sequential, d1), true);
  assert.equal(
    isStepApproveComplete(sequential, [...d1, { stepId: 's3', approverUserId: 'y', decision: 'APPROVE' }]),
    true,
  );
});

test('reject / revision permissions respect explicit allow-lists', () => {
  const step: WorkflowStepDefinition = {
    id: 'p',
    title: 'P',
    approvers: ['u1', 'u2'],
    type: 'PARALLEL',
    logic: { mode: 'ALL_MUST_APPROVE' },
    permissions: {
      rejectToDraftApproverIds: ['u1'],
      requestRevisionApproverIds: ['u2'],
    },
  };
  assert.equal(canUserRejectToDraft('u1', step), true);
  assert.equal(canUserRejectToDraft('u2', step), false);
  assert.equal(canUserRequestRevision('u2', step), true);
  assert.equal(canUserRequestRevision('u1', step), false);
});

test('reject / revision default to all approvers when permission omitted', () => {
  const step: WorkflowStepDefinition = {
    id: 'p',
    title: 'P',
    approvers: ['u1', 'u2'],
    type: 'PARALLEL',
    logic: { mode: 'ALL_MUST_APPROVE' },
  };
  assert.equal(canUserRejectToDraft('u1', step), true);
  assert.equal(canUserRequestRevision('u2', step), true);
});
