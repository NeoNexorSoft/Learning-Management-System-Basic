/*
  Warnings:

  - The primary key for the `coupons` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `discountType` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `discountValue` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `coupons` table. All the data in the column will be lost.
  - Added the required column `discount_type` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `coupons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "coupons" DROP CONSTRAINT "coupons_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "discountType",
DROP COLUMN "discountValue",
DROP COLUMN "expiresAt",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discount_type" "DiscountType" NOT NULL,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "coupons_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "coupons_id_seq";
