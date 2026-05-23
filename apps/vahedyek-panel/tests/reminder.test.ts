import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_REMINDER_SETTINGS,
  chooseReminderPresentation,
  isReminderTargetUser,
  isReminderTrackablePagePath,
  normalizeMobileForReminder,
  normalizePagePathForReminder,
  normalizeReminderSettings,
} from '../app/lib/reminder';

test('normalizeReminderSettings applies defaults and preserves booleans', () => {
  assert.deepEqual(normalizeReminderSettings(null), DEFAULT_REMINDER_SETTINGS);
  assert.deepEqual(
    normalizeReminderSettings({
      includeLastVisitedPage: false,
      includeRecentlyDeveloped: true,
      includeNeedsTesting: false,
      includeCompletedDiscussions: true,
      ignored: false,
    }),
    {
      includeLastVisitedPage: false,
      includeRecentlyDeveloped: true,
      includeNeedsTesting: false,
      includeCompletedDiscussions: true,
    },
  );
});

test('chooseReminderPresentation uses tour for reload, missing or stale activity', () => {
  const now = new Date('2026-05-23T10:00:00.000Z');

  assert.equal(
    chooseReminderPresentation({
      previousActivityExists: false,
      hadPageReload: false,
      lastInputAt: now,
      now,
    }),
    'tour',
  );
  assert.equal(
    chooseReminderPresentation({
      previousActivityExists: true,
      hadPageReload: true,
      lastInputAt: now,
      now,
    }),
    'tour',
  );
  assert.equal(
    chooseReminderPresentation({
      previousActivityExists: true,
      hadPageReload: false,
      lastInputAt: new Date('2026-05-22T09:59:59.000Z'),
      now,
    }),
    'tour',
  );
});

test('chooseReminderPresentation uses tooltip for active same-session activity', () => {
  assert.equal(
    chooseReminderPresentation({
      previousActivityExists: true,
      hadPageReload: false,
      lastInputAt: new Date('2026-05-23T09:55:00.000Z'),
      now: new Date('2026-05-23T10:00:00.000Z'),
    }),
    'tooltip',
  );
});

test('target mobile and path normalization are strict', () => {
  assert.equal(isReminderTargetUser({ mobile: '09177012406' }), true);
  assert.equal(isReminderTargetUser({ mobile: '9177012406' }), true);
  assert.equal(isReminderTargetUser({ mobile: '۰۹۱۷۷۰۱۲۴۰۶' }), true);
  assert.equal(normalizeMobileForReminder('+98 917 701 2406'), '09177012406');
  assert.equal(isReminderTargetUser({ mobile: '09177012407' }), false);
  assert.equal(normalizePagePathForReminder('/contracts/new'), '/contracts/new');
  assert.equal(normalizePagePathForReminder('contracts/new'), '/');
  assert.equal(isReminderTrackablePagePath('/contracts/new'), true);
  assert.equal(isReminderTrackablePagePath('/settings'), false);
  assert.equal(isReminderTrackablePagePath('/settings?tab=reminder'), false);
});
