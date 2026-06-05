'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { upsertClientStorageStateAction } from '../../../../../lib/client-storage-actions';
import {
  getEmployeeSupplementalStorageKey,
  getDefaultEmployeeSupplementalProfile,
  normalizeEmployeeSupplementalProfile,
  type EmployeeSupplementalProfile,
} from '../../../../../lib/employee-contract-drafts';
import type { HydratedClientStorageState } from '../../../../../lib/client-storage-persistence';
import { EmployeeSupplementalProfileEditor } from '../../_components/EmployeeSupplementalProfileEditor';
import { EmployeeSupplementalProfileView } from '../../_components/EmployeeSupplementalProfileView';

type EmployeeProfileEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string | null;
  maritalStatus: string;
  childrenCount: number;
};

function getStorageValue(storageStates: HydratedClientStorageState[], storageKey: string) {
  return storageStates.find((item) => item.storageKey === storageKey)?.value ?? null;
}

function readEmployeeSupplementalProfilesFromStorageStates(
  storageStates: HydratedClientStorageState[],
  tenantId?: string | null,
) {
  const raw = getStorageValue(storageStates, getEmployeeSupplementalStorageKey(tenantId));
  if (!raw) return {} as Record<string, EmployeeSupplementalProfile>;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return {} as Record<string, EmployeeSupplementalProfile>;
    return Object.entries(parsed).reduce<Record<string, EmployeeSupplementalProfile>>((result, [key, value]) => {
      result[key] = normalizeEmployeeSupplementalProfile(value);
      return result;
    }, {});
  } catch {
    return {} as Record<string, EmployeeSupplementalProfile>;
  }
}

export function EmployeeSupplementalProfileClient({
  employee,
  tenantId,
  storageStates,
}: {
  employee: EmployeeProfileEmployee;
  tenantId: string | null;
  storageStates: HydratedClientStorageState[];
}) {
  const [supplemental, setSupplemental] = useState<EmployeeSupplementalProfile>(() => {
    const profiles = readEmployeeSupplementalProfilesFromStorageStates(storageStates, tenantId);
    return profiles[employee.id] ?? getDefaultEmployeeSupplementalProfile();
  });
  const [editorOpen, setEditorOpen] = useState(false);

  const employeeName = `${employee.firstName} ${employee.lastName}`.trim();

  const saveProfile = (value: EmployeeSupplementalProfile) => {
    const normalized = normalizeEmployeeSupplementalProfile(value);
    const profiles = readEmployeeSupplementalProfilesFromStorageStates(storageStates, tenantId);
    const next = { ...profiles, [employee.id]: normalized };
    void upsertClientStorageStateAction(getEmployeeSupplementalStorageKey(tenantId), JSON.stringify(next));
    setSupplemental(normalized);
    setEditorOpen(false);
  };

  return (
    <div className="employee-supplemental-profile-page" dir="rtl" lang="fa">
      <div className="employee-supplemental-profile-toolbar">
        <Link href={`/employees/${employee.id}`} className="draft-template-flow-action is-secondary">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          بازگشت به جزئیات کارمند
        </Link>
        <button type="button" className="draft-template-flow-action is-primary" onClick={() => setEditorOpen(true)}>
          ویرایش مشخصات
        </button>
      </div>

      <EmployeeSupplementalProfileView
        employeeName={employeeName}
        employee={{
          nationalId: employee.nationalId,
          maritalStatus: employee.maritalStatus,
          childrenCount: employee.childrenCount,
        }}
        supplemental={supplemental}
        onEdit={() => setEditorOpen(true)}
        defaultExpanded
      />

      <EmployeeSupplementalProfileEditor
        open={editorOpen}
        employeeName={employeeName}
        value={supplemental}
        employeeMeta={{
          nationalId: employee.nationalId,
          maritalStatus: employee.maritalStatus,
          childrenCount: employee.childrenCount,
        }}
        onCancel={() => setEditorOpen(false)}
        onSubmit={saveProfile}
      />
    </div>
  );
}
