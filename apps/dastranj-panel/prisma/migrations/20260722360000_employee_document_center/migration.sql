CREATE TYPE "EmployeeDocumentSourceType" AS ENUM ('DIRECT_UPLOAD', 'MODULE_GENERATED');
CREATE TYPE "EmployeeDocumentSourceModule" AS ENUM ('CONTRACT', 'PAYROLL', 'REQUEST', 'TERMINATION', 'OTHER');
CREATE TYPE "EmployeeDocumentStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'FINAL', 'REJECTED', 'EXPIRED', 'REPLACED', 'ARCHIVED', 'VOID');
CREATE TYPE "EmployeeDocumentAccessLevel" AS ENUM ('PRIVATE', 'EMPLOYEE', 'MANAGERS', 'HR', 'FINANCIAL');

CREATE TABLE "EmployeeDocument" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "attachmentId" TEXT,
  "contentHash" TEXT,
  "title" TEXT NOT NULL,
  "documentType" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "subCategory" TEXT,
  "description" TEXT,
  "documentDate" TEXT NOT NULL,
  "documentNumber" TEXT,
  "tags" JSONB NOT NULL DEFAULT '[]',
  "accessLevel" "EmployeeDocumentAccessLevel" NOT NULL,
  "sourceType" "EmployeeDocumentSourceType" NOT NULL,
  "sourceModule" "EmployeeDocumentSourceModule" NOT NULL,
  "sourceRecordId" TEXT,
  "sourceHref" TEXT,
  "status" "EmployeeDocumentStatus" NOT NULL DEFAULT 'FINAL',
  "versionNumber" INTEGER NOT NULL DEFAULT 1,
  "parentDocumentId" TEXT,
  "versionReason" TEXT,
  "isCurrentVersion" BOOLEAN NOT NULL DEFAULT true,
  "expiresAt" TEXT,
  "createdBy" TEXT,
  "archivedAt" TIMESTAMP(3),
  "archivedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeDocument_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EmployeeDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "EmployeeDocument_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "EmployeeDocument_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "EmployeeDocument_parentDocumentId_fkey" FOREIGN KEY ("parentDocumentId") REFERENCES "EmployeeDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "EmployeeDocumentAuditLog" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "versionNumber" INTEGER NOT NULL,
  "action" TEXT NOT NULL,
  "actorUserId" TEXT,
  "actorRole" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmployeeDocumentAuditLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EmployeeDocumentAuditLog_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "EmployeeDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "EmployeeDocument_attachmentId_key" ON "EmployeeDocument"("attachmentId");
CREATE UNIQUE INDEX "EmployeeDocument_tenantId_sourceModule_sourceRecordId_key" ON "EmployeeDocument"("tenantId", "sourceModule", "sourceRecordId");
CREATE UNIQUE INDEX "EmployeeDocument_tenantId_employeeId_parentDocumentId_versionNumber_key" ON "EmployeeDocument"("tenantId", "employeeId", "parentDocumentId", "versionNumber");
CREATE INDEX "EmployeeDocument_tenantId_employeeId_isCurrentVersion_status_idx" ON "EmployeeDocument"("tenantId", "employeeId", "isCurrentVersion", "status");
CREATE INDEX "EmployeeDocument_tenantId_employeeId_category_documentDate_idx" ON "EmployeeDocument"("tenantId", "employeeId", "category", "documentDate");
CREATE INDEX "EmployeeDocument_tenantId_employeeId_sourceModule_idx" ON "EmployeeDocument"("tenantId", "employeeId", "sourceModule");
CREATE INDEX "EmployeeDocument_tenantId_employeeId_contentHash_idx" ON "EmployeeDocument"("tenantId", "employeeId", "contentHash");
CREATE INDEX "EmployeeDocumentAuditLog_tenantId_employeeId_createdAt_idx" ON "EmployeeDocumentAuditLog"("tenantId", "employeeId", "createdAt");
CREATE INDEX "EmployeeDocumentAuditLog_tenantId_documentId_createdAt_idx" ON "EmployeeDocumentAuditLog"("tenantId", "documentId", "createdAt");
