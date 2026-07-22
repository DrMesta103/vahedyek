'use server';

import { revalidatePath } from 'next/cache';
import { archiveEmployeeDocument, changeEmployeeDocumentPermission, createDirectEmployeeDocument, updateEmployeeDocumentMetadata } from './employee-documents';

export type EmployeeDocumentActionState = { ok: boolean; message: string };
const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

export async function createEmployeeDocumentAction(_: EmployeeDocumentActionState, form: FormData): Promise<EmployeeDocumentActionState> {
  const employeeId = text(form, 'employeeId');
  try {
    const file = form.get('file');
    if (!(file instanceof File)) throw new Error('فایل سند الزامی است.');
    await createDirectEmployeeDocument({
      employeeId, title: text(form, 'title'), documentType: text(form, 'documentType'), category: text(form, 'category'),
      subCategory: text(form, 'subCategory') || null, description: text(form, 'description') || null,
      documentDate: text(form, 'documentDate'), documentNumber: text(form, 'documentNumber') || null,
      tags: text(form, 'tags').split(',').map((item) => item.trim()).filter(Boolean),
      accessLevel: text(form, 'accessLevel') as 'PRIVATE' | 'EMPLOYEE' | 'MANAGERS' | 'HR' | 'FINANCIAL',
      expiresAt: text(form, 'expiresAt') || null, file,
      parentDocumentId: text(form, 'parentDocumentId') || null, versionReason: text(form, 'versionReason') || null,
    });
    revalidatePath(`/employees/${employeeId}/documents`);
    return { ok: true, message: text(form, 'parentDocumentId') ? 'نسخه جدید سند ثبت شد.' : 'سند با موفقیت ثبت شد.' };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'ثبت سند انجام نشد.' };
  }
}

export async function archiveEmployeeDocumentAction(form: FormData) {
  const employeeId = text(form, 'employeeId');
  await archiveEmployeeDocument(employeeId, text(form, 'documentId'), text(form, 'restore') === 'true');
  revalidatePath(`/employees/${employeeId}/documents`);
  revalidatePath(`/employees/${employeeId}/documents/${text(form, 'documentId')}`);
}

export async function updateEmployeeDocumentMetadataAction(form: FormData) {
  const employeeId = text(form, 'employeeId');
  const documentId = text(form, 'documentId');
  await updateEmployeeDocumentMetadata({
    employeeId, documentId, title: text(form, 'title'), category: text(form, 'category'),
    subCategory: text(form, 'subCategory') || null, documentType: text(form, 'documentType'),
    documentDate: text(form, 'documentDate'), documentNumber: text(form, 'documentNumber') || null,
    tags: text(form, 'tags').split(',').map((item) => item.trim()).filter(Boolean),
    description: text(form, 'description') || null,
  });
  revalidatePath(`/employees/${employeeId}/documents`);
  revalidatePath(`/employees/${employeeId}/documents/${documentId}`);
}

export async function changeEmployeeDocumentPermissionAction(form: FormData) {
  const employeeId = text(form, 'employeeId');
  const documentId = text(form, 'documentId');
  await changeEmployeeDocumentPermission(employeeId, documentId, text(form, 'accessLevel'));
  revalidatePath(`/employees/${employeeId}/documents`);
  revalidatePath(`/employees/${employeeId}/documents/${documentId}`);
}
