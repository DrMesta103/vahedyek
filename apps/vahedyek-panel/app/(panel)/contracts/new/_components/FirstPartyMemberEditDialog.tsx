'use client';

import { FirstPartyInfoEditDialog, resolveFirstPartyEditKind } from './FirstPartyInfoEditDialog';
import { getPartyOneSnapshotMissingFields, type FirstPartySnapshot, type PartyRow } from './partiesTypes';

export function FirstPartyMemberEditDialog({
  open,
  row,
  onClose,
  onSave,
}: {
  open: boolean;
  row: PartyRow | null;
  onClose: () => void;
  onSave: (snapshot: FirstPartySnapshot) => void;
}) {
  if (!row) return null;

  const kind = resolveFirstPartyEditKind({
    partyOneMemberKind: row.partyOneMemberKind,
    personType: row.personType,
  });

  const roleLabel =
    row.tags?.[0] ||
    (kind === 'natural_shareholder'
      ? 'سهام‌دار حقیقی'
      : kind === 'legal_shareholder'
        ? 'سهام‌دار حقوقی'
        : kind === 'business_natural'
          ? 'کسب‌وکار حقیقی'
          : 'کسب‌وکار حقوقی');

  return (
    <FirstPartyInfoEditDialog
      open={open}
      kind={kind}
      name={row.name}
      roleLabel={roleLabel}
      initialSnapshot={row.snapshot}
      mode={getPartyOneSnapshotMissingFields(row).length ? 'complete' : 'edit'}
      onClose={onClose}
      onSave={onSave}
    />
  );
}
