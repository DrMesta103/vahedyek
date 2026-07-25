import { createHash } from 'node:crypto';
import { Prisma } from '../../node_modules/.prisma/client';
import { getSessionContext } from './auth';
import { prisma } from './prisma';

export const EMPLOYEE_DOCUMENT_PERMISSIONS = {
  view: 'employee.documents.view', upload: 'employee.documents.upload', download: 'employee.documents.download',
  edit: 'employee.documents.edit', archive: 'employee.documents.archive', manage: 'employee.documents.manage',
} as const;

export const DOCUMENT_CATEGORIES = {
  IDENTITY: ['کارت ملی', 'شناسنامه', 'پاسپورت', 'اقامت'],
  EDUCATION: ['مدرک تحصیلی', 'گواهینامه', 'مهارت'],
  EMPLOYMENT: ['قرارداد', 'حکم', 'الحاقیه', 'متمم'],
  REQUESTS: ['مرخصی', 'مأموریت', 'اضافه کاری', 'وام'],
  FINANCIAL: ['فیش حقوقی', 'پاداش', 'کسورات', 'تسویه'],
  HEALTH: ['پزشکی', 'بیمه', 'استعلاجی'],
  ORGANIZATION: ['اخطار', 'تشویق', 'مکاتبات'],
  OTHER: ['سایر'],
} as const;

export const SENSITIVE_DOCUMENT_CATEGORIES = new Set(['IDENTITY', 'HEALTH', 'FINANCIAL']);
const DOCUMENT_ACCESS_LEVELS = new Set(['PRIVATE', 'EMPLOYEE', 'MANAGERS', 'HR', 'FINANCIAL']);
const ALLOWED_FILE_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export type DocumentOperation = 'view' | 'upload' | 'download' | 'edit' | 'archive' | 'manage';

export async function getEmployeeDocumentAccess(employeeId: string) {
  const session = await getSessionContext();
  if (!session?.tenantId || !session.userId) return null;
  const membership = await prisma.userTenantMembership.findUnique({
    where: { userId_tenantId: { userId: session.userId, tenantId: session.tenantId } },
    include: { employee: { select: { id: true } }, roles: { include: { role: { include: { permissions: { select: { permissionKey: true } } } } } } },
  });
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, tenantId: session.tenantId },
    select: { id: true, organizationUnits: { select: { organizationUnit: { select: { managerId: true } } } } },
  });
  if (!employee) return null;
  const roles = new Set([membership?.role?.toLowerCase(), ...(membership?.roles.map((item) => item.role.key.toLowerCase()) ?? [])].filter(Boolean) as string[]);
  const permissions = new Set(membership?.roles.flatMap((item) => item.role.permissions.map((permission) => permission.permissionKey)) ?? []);
  const isSelf = membership?.employee?.id === employeeId;
  const isOwner = roles.has('owner');
  const isHr = roles.has('hr_manager');
  const isFinancial = roles.has('financial') || roles.has('finance_manager');
  const managesEmployee = roles.has('manager') && Boolean(membership?.employee?.id) && employee.organizationUnits.some((unit) => unit.organizationUnit.managerId === membership?.employee?.id);
  const has = (key: string) => permissions.has(key);
  const canManage = isOwner || isHr || has(EMPLOYEE_DOCUMENT_PERMISSIONS.manage);
  return {
    tenantId: session.tenantId, userId: session.userId, actorRole: [...roles][0] ?? membership?.role ?? 'unknown',
    isSelf, isOwner, isHr, isFinancial, managesEmployee,
    canView: canManage || isSelf || managesEmployee || isFinancial || has(EMPLOYEE_DOCUMENT_PERMISSIONS.view),
    canUpload: canManage || isSelf || has(EMPLOYEE_DOCUMENT_PERMISSIONS.upload),
    canDownload: canManage || isSelf || managesEmployee || isFinancial || has(EMPLOYEE_DOCUMENT_PERMISSIONS.download),
    canEdit: canManage || has(EMPLOYEE_DOCUMENT_PERMISSIONS.edit),
    canArchive: canManage || has(EMPLOYEE_DOCUMENT_PERMISSIONS.archive),
    canManage,
  };
}

export async function requireEmployeeDocumentAccess(employeeId: string, operation: DocumentOperation) {
  const access = await getEmployeeDocumentAccess(employeeId);
  if (!access || !access[`can${operation[0].toUpperCase()}${operation.slice(1)}` as keyof typeof access]) {
    throw new Error('دسترسی کافی برای این عملیات سند را ندارید.');
  }
  return access;
}

function isSensitiveDocument(document: { category: string; documentType?: string }) {
  return SENSITIVE_DOCUMENT_CATEGORIES.has(document.category) || /حقوقی|قانونی|محرمانه/i.test(document.documentType ?? '');
}

function canAccessDocument(access: NonNullable<Awaited<ReturnType<typeof getEmployeeDocumentAccess>>>, document: { category: string; accessLevel: string; documentType?: string }) {
  if (access.canManage) return true;
  if (isSensitiveDocument(document) && access.managesEmployee) return false;
  if (document.category === 'FINANCIAL' && access.isFinancial) return true;
  if (document.accessLevel === 'PRIVATE') return false;
  if (document.accessLevel === 'HR') return access.isHr;
  if (document.accessLevel === 'FINANCIAL') return access.isFinancial;
  if (document.accessLevel === 'MANAGERS') return access.managesEmployee || access.isSelf;
  return access.isSelf;
}

async function audit(document: { id: string; tenantId: string; employeeId: string; versionNumber: number }, access: { userId: string; actorRole: string }, action: string, metadata: Prisma.InputJsonValue = {}) {
  return prisma.employeeDocumentAuditLog.create({ data: { tenantId: document.tenantId, employeeId: document.employeeId, documentId: document.id, versionNumber: document.versionNumber, action, actorUserId: access.userId, actorRole: access.actorRole, metadata } });
}

export type EmployeeDocumentFilters = { query?: string; category?: string; status?: string; sourceModule?: string; dateFrom?: string; dateTo?: string; creator?: string };

export async function listEmployeeDocuments(employeeId: string, filters: EmployeeDocumentFilters = {}) {
  const access = await requireEmployeeDocumentAccess(employeeId, 'view');
  const documents = await prisma.employeeDocument.findMany({
    where: {
      tenantId: access.tenantId, employeeId,
      category: filters.category || undefined,
      status: filters.status ? filters.status as never : undefined,
      sourceModule: filters.sourceModule ? filters.sourceModule as never : undefined,
      createdBy: filters.creator && !['EMPLOYEE', 'MANAGER', 'HR', 'SYSTEM', 'MODULE'].includes(filters.creator) ? filters.creator : undefined,
      sourceType: filters.creator === 'SYSTEM' || filters.creator === 'MODULE' ? 'MODULE_GENERATED' : undefined,
      auditLogs: filters.creator === 'EMPLOYEE' ? { some: { action: 'CREATE', actorRole: { in: ['employee', 'member'] } } }
        : filters.creator === 'MANAGER' ? { some: { action: 'CREATE', actorRole: 'manager' } }
        : filters.creator === 'HR' ? { some: { action: 'CREATE', actorRole: 'hr_manager' } }
        : undefined,
      documentDate: filters.dateFrom || filters.dateTo ? { gte: filters.dateFrom || undefined, lte: filters.dateTo || undefined } : undefined,
      OR: filters.query ? [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { documentNumber: { contains: filters.query, mode: 'insensitive' } },
        { documentType: { contains: filters.query, mode: 'insensitive' } },
      ] : undefined,
    },
    include: { attachment: { select: { fileName: true, fileType: true, fileSize: true } }, _count: { select: { versions: true, auditLogs: true } } },
    orderBy: [{ isCurrentVersion: 'desc' }, { documentDate: 'desc' }, { createdAt: 'desc' }],
  });
  return { documents: documents.filter((document) => canAccessDocument(access, document)), access };
}

export async function getEmployeeDocument(employeeId: string, documentId: string, logView = true) {
  const access = await requireEmployeeDocumentAccess(employeeId, 'view');
  const document = await prisma.employeeDocument.findFirst({
    where: { id: documentId, tenantId: access.tenantId, employeeId },
    include: {
      attachment: { select: { fileName: true, fileType: true, fileSize: true } },
      parentDocument: { select: { id: true, versionNumber: true } },
      versions: { orderBy: { versionNumber: 'asc' }, select: { id: true, versionNumber: true, status: true, versionReason: true, createdAt: true, createdBy: true } },
      auditLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
  if (!document || !canAccessDocument(access, document)) throw new Error('سند پیدا نشد یا مجوز مشاهده آن را ندارید.');
  if (logView) await audit(document, access, 'VIEW');
  return { document, access };
}

type DirectDocumentInput = {
  employeeId: string; title: string; documentType: string; category: string; subCategory?: string | null; description?: string | null;
  documentDate: string; documentNumber?: string | null; tags?: string[]; accessLevel: 'PRIVATE' | 'EMPLOYEE' | 'MANAGERS' | 'HR' | 'FINANCIAL';
  expiresAt?: string | null; file: File; parentDocumentId?: string | null; versionReason?: string | null;
};

function validateInput(input: DirectDocumentInput) {
  if (!input.title.trim()) throw new Error('عنوان سند الزامی است.');
  if (!Object.hasOwn(DOCUMENT_CATEGORIES, input.category)) throw new Error('دسته سند معتبر نیست.');
  if (!input.documentType.trim()) throw new Error('نوع سند الزامی است.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.documentDate)) throw new Error('تاریخ سند معتبر نیست.');
  if (!input.accessLevel) throw new Error('سطح دسترسی الزامی است.');
  if (!(input.file instanceof File) || input.file.size === 0) throw new Error('فایل سند الزامی است.');
  if (input.file.size > MAX_FILE_SIZE) throw new Error('حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.');
  if (!ALLOWED_FILE_TYPES.has(input.file.type)) throw new Error('فقط PDF و تصاویر JPEG، PNG یا WebP مجاز هستند.');
  if (input.parentDocumentId && !input.versionReason?.trim()) throw new Error('دلیل ایجاد نسخه جدید الزامی است.');
}

export async function createDirectEmployeeDocument(input: DirectDocumentInput) {
  validateInput(input);
  const access = await requireEmployeeDocumentAccess(input.employeeId, input.parentDocumentId ? 'edit' : 'upload');
  if (SENSITIVE_DOCUMENT_CATEGORIES.has(input.category) && !access.canManage && !access.isSelf) throw new Error('ثبت سند حساس نیازمند مجوز منابع انسانی است.');
  const bytes = Buffer.from(await input.file.arrayBuffer());
  const contentHash = createHash('sha256').update(bytes).digest('hex');
  const duplicate = await prisma.employeeDocument.findFirst({ where: { tenantId: access.tenantId, employeeId: input.employeeId, contentHash, status: { notIn: ['ARCHIVED', 'VOID'] } }, select: { id: true } });
  if (duplicate) throw new Error('این فایل قبلاً برای کارمند ثبت شده است.');
  const dataUrl = `data:${input.file.type};base64,${bytes.toString('base64')}`;

  return prisma.$transaction(async (tx) => {
    let versionNumber = 1;
    let parentDocumentId: string | null = null;
    if (input.parentDocumentId) {
      const parent = await tx.employeeDocument.findFirst({ where: { id: input.parentDocumentId, tenantId: access.tenantId, employeeId: input.employeeId, sourceType: 'DIRECT_UPLOAD' } });
      if (!parent || !parent.isCurrentVersion) throw new Error('نسخه مبنا معتبر یا جاری نیست.');
      parentDocumentId = parent.parentDocumentId ?? parent.id;
      const latest = await tx.employeeDocument.aggregate({ where: { tenantId: access.tenantId, employeeId: input.employeeId, OR: [{ id: parentDocumentId }, { parentDocumentId }] }, _max: { versionNumber: true } });
      versionNumber = (latest._max.versionNumber ?? parent.versionNumber) + 1;
      await tx.employeeDocument.updateMany({ where: { tenantId: access.tenantId, employeeId: input.employeeId, OR: [{ id: parent.id }, { parentDocumentId }], isCurrentVersion: true }, data: { isCurrentVersion: false, status: 'REPLACED' } });
    }
    const attachment = await tx.attachment.create({ data: {
      tenantId: access.tenantId, ownerType: 'employee_document', ownerId: input.employeeId,
      categoryId: input.category, categoryName: input.category, titleId: input.documentType, title: input.title,
      fileUrl: dataUrl, fileName: input.file.name, fileType: input.file.type, fileSize: input.file.size,
      issuedAt: input.documentDate, description: input.description ?? null,
    } });
    const document = await tx.employeeDocument.create({ data: {
      tenantId: access.tenantId, employeeId: input.employeeId, attachmentId: attachment.id, contentHash,
      title: input.title.trim(), documentType: input.documentType.trim(), category: input.category, subCategory: input.subCategory ?? null,
      description: input.description?.trim() || null, documentDate: input.documentDate, documentNumber: input.documentNumber?.trim() || null,
      tags: input.tags ?? [], accessLevel: input.accessLevel, sourceType: 'DIRECT_UPLOAD', sourceModule: 'OTHER', status: 'FINAL',
      versionNumber, parentDocumentId, versionReason: input.versionReason?.trim() || null, expiresAt: input.expiresAt || null, createdBy: access.userId,
    } });
    await tx.employeeDocumentAuditLog.create({ data: { tenantId: access.tenantId, employeeId: input.employeeId, documentId: document.id, versionNumber, action: input.parentDocumentId ? 'CREATE_VERSION' : 'CREATE', actorUserId: access.userId, actorRole: access.actorRole, metadata: { contentHash, fileName: input.file.name } } });
    return document;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function archiveEmployeeDocument(employeeId: string, documentId: string, restore = false) {
  const access = await requireEmployeeDocumentAccess(employeeId, 'archive');
  const current = await prisma.employeeDocument.findFirst({ where: { id: documentId, tenantId: access.tenantId, employeeId } });
  if (!current) throw new Error('سند پیدا نشد.');
  if (current.sourceType === 'MODULE_GENERATED' && !access.canManage) throw new Error('سند سیستمی فقط توسط مدیر پرونده قابل آرشیو است.');
  const document = await prisma.employeeDocument.update({ where: { id: documentId }, data: restore ? { status: 'FINAL', archivedAt: null, archivedBy: null } : { status: 'ARCHIVED', archivedAt: new Date(), archivedBy: access.userId } });
  await audit(document, access, restore ? 'RESTORE' : 'ARCHIVE');
  return document;
}

export type EmployeeDocumentMetadataInput = {
  employeeId: string; documentId: string; title: string; category: string; subCategory?: string | null;
  documentType: string; documentDate: string; documentNumber?: string | null; tags?: string[]; description?: string | null;
};

export async function updateEmployeeDocumentMetadata(input: EmployeeDocumentMetadataInput) {
  const access = await requireEmployeeDocumentAccess(input.employeeId, 'edit');
  if (!input.title.trim() || !input.documentType.trim() || !Object.hasOwn(DOCUMENT_CATEGORIES, input.category) || !/^\d{4}-\d{2}-\d{2}$/.test(input.documentDate)) {
    throw new Error('اطلاعات متادیتای سند معتبر یا کامل نیست.');
  }
  const current = await prisma.employeeDocument.findFirst({ where: { id: input.documentId, employeeId: input.employeeId, tenantId: access.tenantId } });
  if (!current) throw new Error('سند پیدا نشد.');
  const oldValues = { title: current.title, category: current.category, subCategory: current.subCategory, documentType: current.documentType, documentDate: current.documentDate, documentNumber: current.documentNumber, tags: current.tags, description: current.description };
  const newValues = { title: input.title.trim(), category: input.category, subCategory: input.subCategory?.trim() || null, documentType: input.documentType.trim(), documentDate: input.documentDate, documentNumber: input.documentNumber?.trim() || null, tags: input.tags ?? [], description: input.description?.trim() || null };
  const document = await prisma.$transaction(async (tx) => {
    const updated = await tx.employeeDocument.update({ where: { id: current.id }, data: newValues });
    await tx.employeeDocumentAuditLog.create({ data: { tenantId: current.tenantId, employeeId: current.employeeId, documentId: current.id, versionNumber: current.versionNumber, action: 'UPDATE_METADATA', actorUserId: access.userId, actorRole: access.actorRole, metadata: { oldValues, newValues } } });
    return updated;
  });
  return document;
}

export async function changeEmployeeDocumentPermission(employeeId: string, documentId: string, accessLevel: string) {
  const access = await requireEmployeeDocumentAccess(employeeId, 'manage');
  if (!DOCUMENT_ACCESS_LEVELS.has(accessLevel)) throw new Error('سطح دسترسی سند معتبر نیست.');
  const current = await prisma.employeeDocument.findFirst({ where: { id: documentId, employeeId, tenantId: access.tenantId } });
  if (!current) throw new Error('سند پیدا نشد.');
  if (current.accessLevel === accessLevel) return current;
  return prisma.$transaction(async (tx) => {
    const updated = await tx.employeeDocument.update({ where: { id: current.id }, data: { accessLevel: accessLevel as never } });
    await tx.employeeDocumentAuditLog.create({ data: { tenantId: current.tenantId, employeeId, documentId: current.id, versionNumber: current.versionNumber, action: 'CHANGE_PERMISSION', actorUserId: access.userId, actorRole: access.actorRole, metadata: { previousPermission: current.accessLevel, newPermission: accessLevel } } });
    return updated;
  });
}

export async function registerModuleEmployeeDocument(input: { tenantId: string; employeeId: string; title: string; documentType: string; category: string; documentDate: string; sourceModule: 'CONTRACT' | 'PAYROLL' | 'REQUEST' | 'TERMINATION'; sourceRecordId: string; sourceHref: string; createdBy?: string | null }) {
  const employee = await prisma.employee.findFirst({ where: { id: input.employeeId, tenantId: input.tenantId }, select: { id: true } });
  if (!employee) throw new Error('employee_not_found');
  return prisma.employeeDocument.upsert({
    where: { tenantId_sourceModule_sourceRecordId: { tenantId: input.tenantId, sourceModule: input.sourceModule, sourceRecordId: input.sourceRecordId } },
    update: { title: input.title, documentType: input.documentType, category: input.category, documentDate: input.documentDate, sourceHref: input.sourceHref },
    create: { ...input, sourceType: 'MODULE_GENERATED', status: 'FINAL', versionNumber: 1, isCurrentVersion: true, accessLevel: input.category === 'FINANCIAL' ? 'FINANCIAL' : 'HR' },
  });
}

export async function syncEmployeeDocumentReferences(employeeId: string) {
  const access = await requireEmployeeDocumentAccess(employeeId, 'view');
  const [contracts, requests, terminations] = await Promise.all([
    prisma.employeeContract.findMany({ where: { tenantId: access.tenantId, employeeId, status: { in: ['active', 'ended', 'TERMINATED', 'APPROVED'] } }, select: { id: true, contractNumber: true, startDate: true, createdAt: true } }),
    prisma.employeeRequest.findMany({ where: { tenantId: access.tenantId, employeeId }, select: { id: true, requestType: true, startDate: true, createdAt: true } }),
    prisma.employeeTerminationIntent.findMany({ where: { tenantId: access.tenantId, employeeId }, select: { id: true, createdAt: true } }),
  ]);
  await Promise.all([
    ...contracts.map((item) => registerModuleEmployeeDocument({ tenantId: access.tenantId, employeeId, title: `قرارداد ${item.contractNumber ?? ''}`.trim(), documentType: 'قرارداد', category: 'EMPLOYMENT', documentDate: item.startDate ?? item.createdAt.toISOString().slice(0, 10), sourceModule: 'CONTRACT', sourceRecordId: item.id, sourceHref: `/employees/${employeeId}/contracts` })),
    ...requests.map((item) => registerModuleEmployeeDocument({ tenantId: access.tenantId, employeeId, title: `درخواست ${item.requestType}`, documentType: 'درخواست کارمند', category: 'REQUESTS', documentDate: item.startDate ?? item.createdAt.toISOString().slice(0, 10), sourceModule: 'REQUEST', sourceRecordId: item.id, sourceHref: `/employees/${employeeId}/requests` })),
    ...terminations.map((item) => registerModuleEmployeeDocument({ tenantId: access.tenantId, employeeId, title: 'فرایند خاتمه همکاری', documentType: 'خاتمه همکاری', category: 'FINANCIAL', documentDate: item.createdAt.toISOString().slice(0, 10), sourceModule: 'TERMINATION', sourceRecordId: item.id, sourceHref: `/employees/${employeeId}` })),
  ]);
}

export async function getDocumentDownload(employeeId: string, documentId: string, action: 'DOWNLOAD' | 'VIEW_FILE' = 'DOWNLOAD') {
  const access = await requireEmployeeDocumentAccess(employeeId, 'download');
  const document = await prisma.employeeDocument.findFirst({ where: { id: documentId, tenantId: access.tenantId, employeeId }, include: { attachment: true } });
  if (!document || !canAccessDocument(access, document)) throw new Error('دسترسی دانلود سند را ندارید.');
  if (!document.attachment) throw new Error('فایل این سند در ماژول مرجع نگهداری می‌شود.');
  await audit(document, access, action, { fileName: document.attachment.fileName });
  return { fileUrl: document.attachment.fileUrl, fileName: document.attachment.fileName, fileType: document.attachment.fileType ?? 'application/octet-stream' };
}
