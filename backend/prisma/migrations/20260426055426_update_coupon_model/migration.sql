/*
  Warnings:

  - The primary key for the `coupons` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `discount_type` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `coupons` table. All the data in the column will be lost.
  - The `id` column on the `coupons` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `discountType` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountValue` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `coupons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "coupons" DROP CONSTRAINT "coupons_pkey",
DROP COLUMN "created_at",
DROP COLUMN "discount_type",
DROP COLUMN "expires_at",
DROP COLUMN "is_active",
DROP COLUMN "value",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discountType" "DiscountType" NOT NULL,
ADD COLUMN     "discountValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "coupons_pkey" PRIMARY KEY ("id");
