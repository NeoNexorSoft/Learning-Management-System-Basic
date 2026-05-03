/*
  Warnings:

  - The `video_url` column on the `lessons` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `file_url` column on the `lessons` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "video_url",
ADD COLUMN     "video_url" TEXT[],
DROP COLUMN "file_url",
ADD COLUMN     "file_url" TEXT[];
