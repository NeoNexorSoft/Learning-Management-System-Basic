-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "invoice_number" TEXT,
ADD COLUMN "payment_method" TEXT;

-- Backfill invoice_number with a unique placeholder for existing rows
UPDATE "transactions" SET "invoice_number" = 'INV-LEGACY-' || id WHERE "invoice_number" IS NULL;

-- Make invoice_number NOT NULL
ALTER TABLE "transactions" ALTER COLUMN "invoice_number" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_invoice_number_key" ON "transactions"("invoice_number");
