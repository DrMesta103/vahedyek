CREATE TYPE "EmployeeRequestType" AS ENUM (
  'daily_leave',
  'hourly_leave',
  'reward_leave',
  'unpaid_leave',
  'sick_leave',
  'overtime',
  'attendance',
  'remote_work',
  'mission',
  'salary_advance',
  'loan'
);

CREATE TYPE "EmployeeRequestStatus" AS ENUM (
  'pending',
  'approved',
  'rejected',
  'canceled'
);

CREATE TYPE "EmployeeRequestSubmissionMode" AS ENUM (
  'approved',
  'pending'
);

CREATE TYPE "EmployeeRequestRangeType" AS ENUM (
  'full_day',
  'multi_day',
  'hourly',
  'range',
  'point'
);

CREATE TYPE "AttendanceActionType" AS ENUM (
  'check_in',
  'check_out',
  'correction'
);

CREATE TABLE "CompanyLoan" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT,
  "title" TEXT NOT NULL,
  "guarantorCount" INTEGER NOT NULL,
  "minAmount" DECIMAL(18, 2) NOT NULL,
  "maxAmount" DECIMAL(18, 2) NOT NULL,
  "minInstallments" INTEGER NOT NULL,
  "maxInstallments" INTEGER NOT NULL,
  "feeRate" DECIMAL(7, 3) NOT NULL,
  "interestRate" DECIMAL(7, 3) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyLoan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmployeeRequest" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT,
  "employeeId" TEXT NOT NULL,
  "requestType" "EmployeeRequestType" NOT NULL,
  "status" "EmployeeRequestStatus" NOT NULL DEFAULT 'pending',
  "submissionMode" "EmployeeRequestSubmissionMode" NOT NULL DEFAULT 'pending',
  "startDate" TEXT,
  "endDate" TEXT,
  "startTime" TEXT,
  "endTime" TEXT,
  "dateTime" TEXT,
  "rangeType" "EmployeeRequestRangeType",
  "attendanceActionType" "AttendanceActionType",
  "amount" DECIMAL(18, 2),
  "loanId" TEXT,
  "installments" INTEGER,
  "reasonId" TEXT,
  "description" TEXT,
  "calculatedDurationMinutes" INTEGER,
  "calculationMeta" JSONB NOT NULL DEFAULT '{}',
  "createdBy" TEXT,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "rejectedBy" TEXT,
  "rejectedAt" TIMESTAMP(3),
  "canceledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Attachment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT,
  "ownerType" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "categoryId" TEXT,
  "categoryName" TEXT NOT NULL,
  "titleId" TEXT,
  "title" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileType" TEXT,
  "fileSize" INTEGER,
  "issuedAt" TEXT,
  "description" TEXT,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CompanyLoan_tenantId_idx" ON "CompanyLoan"("tenantId");
CREATE INDEX "CompanyLoan_tenantId_isActive_idx" ON "CompanyLoan"("tenantId", "isActive");

CREATE INDEX "EmployeeRequest_tenantId_employeeId_idx" ON "EmployeeRequest"("tenantId", "employeeId");
CREATE INDEX "EmployeeRequest_tenantId_requestType_idx" ON "EmployeeRequest"("tenantId", "requestType");
CREATE INDEX "EmployeeRequest_tenantId_status_idx" ON "EmployeeRequest"("tenantId", "status");
CREATE INDEX "EmployeeRequest_reasonId_idx" ON "EmployeeRequest"("reasonId");
CREATE INDEX "EmployeeRequest_loanId_idx" ON "EmployeeRequest"("loanId");

CREATE INDEX "Attachment_tenantId_ownerType_ownerId_idx" ON "Attachment"("tenantId", "ownerType", "ownerId");
CREATE INDEX "Attachment_ownerType_ownerId_idx" ON "Attachment"("ownerType", "ownerId");

ALTER TABLE "CompanyLoan"
  ADD CONSTRAINT "CompanyLoan_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmployeeRequest"
  ADD CONSTRAINT "EmployeeRequest_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmployeeRequest"
  ADD CONSTRAINT "EmployeeRequest_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmployeeRequest"
  ADD CONSTRAINT "EmployeeRequest_reasonId_fkey"
  FOREIGN KEY ("reasonId") REFERENCES "RequestReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EmployeeRequest"
  ADD CONSTRAINT "EmployeeRequest_loanId_fkey"
  FOREIGN KEY ("loanId") REFERENCES "CompanyLoan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Attachment"
  ADD CONSTRAINT "Attachment_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
