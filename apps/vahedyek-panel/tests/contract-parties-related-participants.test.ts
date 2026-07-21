import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStep2 } from '../app/lib/contractValidation';
import {
  getPartyOneSnapshotMissingFields,
  mapRowsToPayload,
} from '../app/(panel)/contracts/new/_components/partiesTypes';
import type { ContractPartiesData, FirstPartyRelatedParticipant } from '../app/types/contract';
import { parseContractDraftReturnContext } from '../app/(panel)/business-settings/profile/_components/ContractDraftReturnButton';

function makePartiesData(firstPartyRelatedParticipants?: FirstPartyRelatedParticipant[]): ContractPartiesData {
  return {
    partyOneMode: 'dang',
    partyTwoMode: 'dang',
    partyOne: [
      {
        personId: 'tenant-root',
        personType: 'legal',
        name: 'کسب‌وکار حقوقی',
        isPrimary: true,
        partyOneMemberKind: 'business',
        share: { value: 6, mode: 'dang' },
      },
    ],
    partyTwo: [
      {
        personId: 'buyer-1',
        personType: 'natural',
        name: 'خریدار',
        isPrimary: true,
        share: { value: 6, mode: 'dang' },
      },
    ],
    ...(firstPartyRelatedParticipants ? { firstPartyRelatedParticipants } : {}),
  };
}

const representative: FirstPartyRelatedParticipant = {
  id: 'related-representative-1',
  sourceId: 'profile-representative-1',
  sourceDirectoryId: null,
  personType: 'natural',
  role: 'representative',
  name: 'نماینده اول',
  parentParticipantId: null,
  parentSourceId: 'tenant-root',
};

test('existing parties payloads without related participants remain valid', () => {
  const result = validateStep2(makePartiesData());

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test('an intentionally empty legal first party can be saved without changing the default validation contract', () => {
  const data = makePartiesData();
  data.partyOne = [];

  assert.equal(validateStep2(data).valid, false);
  assert.equal(validateStep2(data, { allowEmptyPartyOne: true }).valid, true);
});

test('first-party member kind is included in the persisted payload', () => {
  const [party] = mapRowsToPayload(
    [
      {
        id: 'legal-shareholder-1',
        name: 'شرکت سهام‌دار',
        personType: 'legal',
        shareValue: 3,
        isPrimary: true,
        partyOneMemberKind: 'legal_shareholder',
        snapshot: { legalName: 'شرکت سهام‌دار', nationalId: '101', registrationNumber: '12', registrationDate: '1400/01/01', economicCode: '13' },
      },
    ],
    'dang',
  );

  assert.equal(party.partyOneMemberKind, 'legal_shareholder');
  assert.equal(party.snapshot?.legalName, 'شرکت سهام‌دار');
});

test('first-party snapshot validation uses member-specific required fields', () => {
  assert.deepEqual(
    getPartyOneSnapshotMissingFields({
      personType: 'legal',
      partyOneMemberKind: 'business',
      snapshot: { legalName: 'شرکت', tradeName: '', nationalId: '', contactName: 'نماینده' },
    }),
    ['نام تجاری', 'شناسه ملی'],
  );
  assert.deepEqual(
    getPartyOneSnapshotMissingFields({
      personType: 'natural',
      partyOneMemberKind: 'natural_shareholder',
      snapshot: { fullName: 'علی کریمی' },
    }),
    [],
  );
});

test('valid first-party representatives, board members, and shareholders are accepted', () => {
  const legalShareholder: FirstPartyRelatedParticipant = {
    id: 'related-legal-shareholder-1',
    sourceId: 'profile-legal-shareholder-1',
    personType: 'legal',
    role: 'legal_shareholder',
    name: 'شرکت سهام‌دار',
  };
  const result = validateStep2(
    makePartiesData([
      representative,
      {
        id: 'related-board-1',
        sourceId: 'profile-board-1',
        personType: 'natural',
        role: 'board_member',
        parentSourceId: 'tenant-root',
        name: 'عضو هیئت‌مدیره',
      },
      {
        id: 'related-natural-shareholder-1',
        sourceId: 'profile-natural-shareholder-1',
        personType: 'natural',
        role: 'natural_shareholder',
        name: 'سهام‌دار حقیقی',
      },
      legalShareholder,
      {
        id: 'related-nested-representative-1',
        sourceId: 'profile-nested-representative-1',
        personType: 'natural',
        role: 'representative',
        name: 'نماینده سهام‌دار حقوقی',
        parentParticipantId: legalShareholder.id,
      },
    ]),
  );

  assert.equal(result.valid, true);
});

test('a repeated source cannot be attached twice with the same role', () => {
  const result = validateStep2(
    makePartiesData([
      representative,
      {
        ...representative,
        id: 'related-representative-2',
      },
    ]),
  );

  assert.equal(result.valid, false);
  assert.ok(result.errors.firstPartyRelatedParticipants);
});

test('the same representative can be attached to different first-party parents', () => {
  const data = makePartiesData([
    { ...representative, parentSourceId: 'tenant-root' },
    { ...representative, id: 'related-representative-2', parentSourceId: 'legal-shareholder-1' },
  ]);
  data.partyOne.push({
    personId: 'legal-shareholder-1',
    personType: 'legal',
    name: 'Legal shareholder',
    partyOneMemberKind: 'legal_shareholder',
    share: { value: 0, mode: 'dang' },
  });
  const result = validateStep2(data);

  assert.equal(result.valid, true);
});

test('related participant person type must match its role', () => {
  const result = validateStep2(
    makePartiesData([
      {
        ...representative,
        personType: 'legal',
      },
    ]),
  );

  assert.equal(result.valid, false);
  assert.ok(result.errors.firstPartyRelatedParticipants);
});

test('a parent participant must be an attached legal shareholder', () => {
  const result = validateStep2(
    makePartiesData([
      representative,
      {
        id: 'related-board-1',
        sourceId: 'profile-board-1',
        personType: 'natural',
        role: 'board_member',
        name: 'عضو هیئت‌مدیره',
        parentParticipantId: representative.id,
      },
    ]),
  );

  assert.equal(result.valid, false);
  assert.ok(result.errors.firstPartyRelatedParticipants);
});

test('duplicate first-party members and orphaned related participants are rejected', () => {
  const duplicate = makePartiesData();
  duplicate.partyOne.push({ ...duplicate.partyOne[0] });
  assert.ok(validateStep2(duplicate).errors.partyOne);

  const orphaned = makePartiesData([{ ...representative, parentSourceId: 'missing-parent' }]);
  assert.ok(validateStep2(orphaned).errors.firstPartyRelatedParticipants);
});

test('board members can only belong to the tenant business card', () => {
  const data = makePartiesData([
    {
      ...representative,
      id: 'board-1',
      role: 'board_member',
      parentSourceId: 'legal-shareholder-1',
    },
  ]);
  data.partyOne.push({
    personId: 'legal-shareholder-1',
    personType: 'legal',
    name: 'Legal shareholder',
    partyOneMemberKind: 'legal_shareholder',
    share: { value: 0, mode: 'dang' },
  });

  assert.ok(validateStep2(data).errors.firstPartyRelatedParticipants);
});

test('contract return context requires the exact draft and first-party dialog state', () => {
  const context = parseContractDraftReturnContext(
    '/contracts/new?section=parties&draftId=draft-1&returnSection=parties&returnDialog=partyOne&returnTab=natural_shareholder',
  );
  assert.equal(context?.draftId, 'draft-1');
  assert.equal(context?.tab, 'natural_shareholder');
  assert.equal(parseContractDraftReturnContext('/business-settings/profile/shareholders?tab=natural'), null);
  assert.equal(parseContractDraftReturnContext('/contracts/new?section=parties&draftId=draft-1'), null);
});
