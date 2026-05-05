/*
  Warnings:

  - You are about to drop the column `file_url` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `video_url` on the `lessons` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "file_url",
DROP COLUMN "video_url",
ADD COLUMN     "file_urls" TEXT[],
ADD COLUMN     "video_urls" TEXT[];
