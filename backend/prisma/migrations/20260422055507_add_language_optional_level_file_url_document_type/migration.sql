-- AlterEnum
ALTER TYPE "LessonType" ADD VALUE 'DOCUMENT';

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_category_id_fkey";

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "language" TEXT DEFAULT 'English',
ALTER COLUMN "category_id" DROP NOT NULL,
ALTER COLUMN "level" DROP NOT NULL;

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "file_url" TEXT;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
