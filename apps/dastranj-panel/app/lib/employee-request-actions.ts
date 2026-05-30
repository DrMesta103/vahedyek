'use server';

import { revalidatePath } from 'next/cache';
import {
  deleteCompanyLoan,
  deleteEmployeeRequest,
  updateEmployeeRequestStatus,
  upsertCompanyLoan,
  upsertEmployeeRequest,
  type CompanyLoanItem,
  type EmployeeRequestFormPayload,
  type EmployeeRequestStatus,
} from './employee-requests';

export async function saveEmployeeRequestAction(payload: EmployeeRequestFormPayload) {
  const result = await upsertEmployeeRequest(payload);
  revalidatePath(`/employees/${payload.employeeId}/requests`);
  revalidatePath(`/employees/${payload.employeeId}`);
  return result;
}

export async function changeEmployeeRequestStatusAction(
  id: string,
  employeeId: string,
  status: EmployeeRequestStatus,
) {
  const result = await updateEmployeeRequestStatus(id, status);
  revalidatePath(`/employees/${employeeId}/requests`);
  return result;
}

export async function deleteEmployeeRequestAction(id: string, employeeId: string) {
  const result = await deleteEmployeeRequest(id);
  revalidatePath(`/employees/${employeeId}/requests`);
  return result;
}

export async function saveCompanyLoanAction(input: Omit<CompanyLoanItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const result = await upsertCompanyLoan(input);
  revalidatePath('/business-settings/company-loans');
  return result;
}

export async function deleteCompanyLoanAction(id: string) {
  const result = await deleteCompanyLoan(id);
  revalidatePath('/business-settings/company-loans');
  return result;
}
