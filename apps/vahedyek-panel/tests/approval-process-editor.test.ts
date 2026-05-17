import test from 'node:test';
import assert from 'node:assert/strict';
import {
  attachApproverToStep,
  buildApprovalProcessDraft,
  buildApprovalRoadmapItems,
  getApprovalProcessDraftStorageKey,
  parseApprovalProcessDraft,
} from '../app/lib/approvalProcessEditor';
import type { WorkflowStepDefinition } from '../app/lib/workflowTypes';

const steps: WorkflowStepDefinition[] = [
  {
    id: 'stage-1',
    title: 'بررسی اولیه',
    approvers: ['u1'],
    finalApproverId: null,
    logic: { mode: 'ALL_MUST_APPROVE' },
    type: 'PARALLEL',
  },
  {
    id: 'stage-2',
    title: 'بررسی نهایی',
    approvers: ['u2', 'u3'],
    finalApproverId: 'u3',
    logic: { mode: 'MINIMUM_COUNT', count: 2 },
    type: 'SEQUENTIAL',
  },
];

test('approval process draft key is deterministic for new and existing workflow', () => {
  assert.equal(getApprovalProcessDraftStorageKey(), 'approval-process:draft:new');
  assert.equal(getApprovalProcessDraftStorageKey('wf-10'), 'approval-process:draft:wf-10');
});

test('approval process draft round-trips through storage serialization', () => {
  const draft = buildApprovalProcessDraft({
    title: 'فرایند فروش',
    usageType: 'residential',
    finalApproverUserId: 'u9',
    buyerShouldApprove: true,
    workflowActive: true,
    globalType: 'SEQUENTIAL',
    steps,
    openStepId: 'stage-2',
    targetStageId: 'stage-2',
  });

  const parsed = parseApprovalProcessDraft(JSON.stringify(draft));
  assert.ok(parsed);
  assert.equal(parsed?.title, 'فرایند فروش');
  assert.equal(parsed?.globalType, 'SEQUENTIAL');
  assert.equal(parsed?.steps.length, 2);
  assert.equal(parsed?.openStepId, 'stage-2');
  assert.equal(parsed?.targetStageId, 'stage-2');
});

test('attachApproverToStep adds approver once and leaves other steps untouched', () => {
  const once = attachApproverToStep(steps, 'stage-1', 'u4');
  assert.deepEqual(once[0]?.approvers, ['u1', 'u4']);
  assert.deepEqual(once[1]?.approvers, ['u2', 'u3']);

  const twice = attachApproverToStep(once, 'stage-1', 'u4');
  assert.deepEqual(twice[0]?.approvers, ['u1', 'u4']);
});

test('roadmap summary exposes processing and completion labels', () => {
  const roadmap = buildApprovalRoadmapItems(steps);
  assert.equal(roadmap.length, 2);
  assert.equal(roadmap[0]?.processingLabel, 'بدون ترتیب');
  assert.equal(roadmap[0]?.completionLabel, 'تایید کامل همه تاییدکنندگان');
  assert.equal(roadmap[1]?.processingLabel, 'مرحله‌به‌مرحله');
  assert.equal(roadmap[1]?.completionLabel, 'حداقل 2 تایید');
  assert.equal(roadmap[1]?.finalApproverId, 'u3');
});
