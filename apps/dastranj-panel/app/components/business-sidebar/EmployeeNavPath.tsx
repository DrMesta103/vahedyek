'use client';

import { DastRanjNavPath } from './DastRanjNavPathProvider';

type EmployeeNavPathProps = {
  employeeId: string;
  employeeName: string;
  currentLabel: string;
};

export function EmployeeNavPath({ employeeId, employeeName, currentLabel }: EmployeeNavPathProps) {
  return (
    <DastRanjNavPath
      tail={[
        { label: employeeName, href: `/employees/${employeeId}`, id: `employee-${employeeId}` },
        { label: currentLabel, id: `employee-${employeeId}-${currentLabel}` },
      ]}
    />
  );
}
