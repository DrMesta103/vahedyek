-- جداول رسید و کیف‌پول مشتری که در schema بودند ولی در تاریخچهٔ migration نیامده بودند.

CREATE TABLE "ContractReceipt" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "allocationMode" TEXT NOT NULL,
    "allocationDate" TEXT NOT NULL,
    "transferKind" TEXT NOT NULL,
    "depositorName" TEXT NOT NULL,
    "paidAmountRial" DECIMAL(18,2) NOT NULL,
    "depositDate" TEXT NOT NULL,
    "depositTime" TEXT,
    "destinationValue" TEXT,
    "destinationHolder" TEXT,
    "destinationHolders" JSONB NOT NULL DEFAULT '[]',
    "trackingNumber" TEXT,
    "referenceNumber" TEXT,
    "receiptNumber" TEXT,
    "notes" TEXT,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractReceipt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContractCustomerWalletLedger" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "receiptId" TEXT,
    "amountRial" DECIMAL(18,2) NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'overpayment',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractCustomerWalletLedger_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContractReceipt_tenantId_draftId_idx" ON "ContractReceipt"("tenantId", "draftId");
CREATE INDEX "ContractReceipt_draftId_allocationDate_idx" ON "ContractReceipt"("draftId", "allocationDate");

CREATE INDEX "ContractCustomerWalletLedger_tenantId_draftId_idx" ON "ContractCustomerWalletLedger"("tenantId", "draftId");
CREATE INDEX "ContractCustomerWalletLedger_receiptId_idx" ON "ContractCustomerWalletLedger"("receiptId");

ALTER TABLE "ContractReceipt"
ADD CONSTRAINT "ContractReceipt_draftId_fkey"
FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContractCustomerWalletLedger"
ADD CONSTRAINT "ContractCustomerWalletLedger_draftId_fkey"
FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContractCustomerWalletLedger"
ADD CONSTRAINT "ContractCustomerWalletLedger_receiptId_fkey"
FOREIGN KEY ("receiptId") REFERENCES "ContractReceipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
