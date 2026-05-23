import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNormalizedStages, buildScheduleSummaries, type PhysicalProgressScheduleVersion } from '../app/lib/physicalProgressScheduleLogic';

test('buildNormalizedStages rejects totals other than 100 and invalid date order', () => {
  const invalidTotal = buildNormalizedStages([
    { title: 'اسکلت', weight: 40, plannedStartDate: '1404/01/01', plannedEndDate: '1404/03/01' },
    { title: 'نازک‌کاری', weight: 20, plannedStartDate: '1404/03/02', plannedEndDate: '1404/06/01' },
  ]);
  assert.equal(invalidTotal.validationError, 'جمع وزن مراحل باید دقیقاً ۱۰۰٪ باشد.');

  const invalidDate = buildNormalizedStages([{ title: 'اسکلت', weight: 100, plannedStartDate: '1404/03/01', plannedEndDate: '1404/02/01' }]);
  assert.equal(invalidDate.validationError, 'تاریخ پایان مرحله "اسکلت" باید بعد از تاریخ شروع باشد.');
});

test('buildScheduleSummaries returns latest non-archived version per schedule lineage', () => {
  const stages = [
    {
      id: 's1',
      title: 'اسکلت',
      weight: 100,
      plannedStartDate: '1404/01/01',
      plannedEndDate: '1404/03/01',
      description: '',
      order: 0,
      isCompleted: false,
      completedAt: null,
      libraryTag: 'اسکلت',
    },
  ];

  const versions: PhysicalProgressScheduleVersion[] = [
    {
      id: 'v1',
      scheduleKey: 'lineage-a',
      blockId: 'b1',
      blockName: 'B1',
      title: 'برنامه بلوک B1',
      version: 1,
      createdAt: '2026-05-21T08:00:00.000Z',
      updatedAt: '2026-05-21T08:00:00.000Z',
      createdByUserId: 'u1',
      createdByName: 'مدیر پروژه',
      stages,
      sourceVersionId: null,
      archivedAt: null,
      archivedByUserId: null,
      archivedByName: null,
    },
    {
      id: 'v2',
      scheduleKey: 'lineage-a',
      blockId: 'b1',
      blockName: 'B1',
      title: 'برنامه بلوک B1',
      version: 2,
      createdAt: '2026-05-21T09:00:00.000Z',
      updatedAt: '2026-05-21T09:00:00.000Z',
      createdByUserId: 'u2',
      createdByName: 'مدیر پروژه',
      stages: [{ ...stages[0], id: 's2', weight: 60, plannedEndDate: '1404/02/01' }],
      sourceVersionId: 'v1',
      archivedAt: null,
      archivedByUserId: null,
      archivedByName: null,
    },
    {
      id: 'archived',
      scheduleKey: 'lineage-b',
      blockId: 'b2',
      blockName: 'B2',
      title: 'برنامه بلوک B2',
      version: 1,
      createdAt: '2026-05-21T07:00:00.000Z',
      updatedAt: '2026-05-21T07:00:00.000Z',
      createdByUserId: 'u1',
      createdByName: 'مدیر پروژه',
      stages: [{ ...stages[0], id: 's3', plannedEndDate: '1404/02/01' }],
      sourceVersionId: null,
      archivedAt: '2026-05-21T10:00:00.000Z',
      archivedByUserId: 'u1',
      archivedByName: 'مدیر پروژه',
    },
  ];

  const summaries = buildScheduleSummaries(versions);
  assert.equal(summaries.length, 1);
  assert.equal(summaries[0]?.scheduleKey, 'lineage-a');
  assert.equal(summaries[0]?.version, 2);
  assert.equal(summaries[0]?.totalWeight, 60);
});
