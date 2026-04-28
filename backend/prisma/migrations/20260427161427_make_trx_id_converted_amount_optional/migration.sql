-- AlterTable: make trx_id and converted_amount nullable
ALTER TABLE "transactions" ALTER COLUMN "trx_id" DROP NOT NULL;
ALTER TABLE "transactions" ALTER COLUMN "converted_amount" DROP NOT NULL;
