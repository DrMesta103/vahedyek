'use server';

import { revalidatePath } from 'next/cache';
import { createContractVersion, transitionContract, type ContractLifecycleStatus, type ContractOperation } from './employee-contract-lifecycle';

const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

export async function createEmployeeContractVersionAction(form: FormData) {
  const employeeId = text(form, 'employeeId');
  await createContractVersion({
    employeeId,
    operationType: text(form, 'operationType') as ContractOperation,
    startDate: text(form, 'startDate'),
    endDate: text(form, 'endDate') || null,
    effectiveDate: text(form, 'effectiveDate'),
    contractNumber: text(form, 'contractNumber') || null,
    contractType: text(form, 'contractType'),
    reason: text(form, 'reason'),
    attachmentUrl: text(form, 'attachmentUrl') || null,
    parentContractId: text(form, 'parentContractId') || null,
  });
  revalidatePath(`/employees/${employeeId}`);
  revalidatePath(`/employees/${employeeId}/contracts`);
}

export async function transitionEmployeeContractAction(form: FormData) {
  const employeeId = text(form, 'employeeId');
  await transitionContract(text(form, 'contractId'), text(form, 'target') as ContractLifecycleStatus, text(form, 'reason'));
  revalidatePath(`/employees/${employeeId}`);
  revalidatePath(`/employees/${employeeId}/contracts`);
  revalidatePath(`/employees/${employeeId}/history`);
}
