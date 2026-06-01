'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getDefaultEmployeeSupplementalProfile,
  normalizeEmployeeSupplementalProfile,
  readEmployeeSupplementalProfiles,
  persistEmployeeSupplementalProfiles,
  type EmployeeSupplementalProfile,
} from '../../../../../lib/employee-contract-drafts';
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

export function EmployeeSupplementalProfileClient({ employee }: { employee: EmployeeProfileEmployee }) {
  const [supplemental, setSupplemental] = useState<EmployeeSupplementalProfile>(getDefaultEmployeeSupplementalProfile());
  const [loaded, setLoaded] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    const profiles = readEmployeeSupplementalProfiles();
    setSupplemental(profiles[employee.id] ?? getDefaultEmployeeSupplementalProfile());
    setLoaded(true);
  }, [employee.id]);

  const employeeName = `${employee.firstName} ${employee.lastName}`.trim();

  const saveProfile = (value: EmployeeSupplementalProfile) => {
    const normalized = normalizeEmployeeSupplementalProfile(value);
    const profiles = readEmployeeSupplementalProfiles();
    const next = { ...profiles, [employee.id]: normalized };
    persistEmployeeSupplementalProfiles(next);
    setSupplemental(normalized);
    setEditorOpen(false);
  };

  if (!loaded) return null;

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
