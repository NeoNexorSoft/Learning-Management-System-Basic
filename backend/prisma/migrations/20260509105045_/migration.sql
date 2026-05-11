/*
  Warnings:

  - A unique constraint covering the columns `[assignment_id,student_id]` on the table `submissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teacher_id` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Made the column `due_date` on table `assignments` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updated_at` to the `submissions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AssignmentTarget" AS ENUM ('COURSE', 'ALL_ENROLLED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_lesson_id_fkey";

-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "course_id" TEXT,
ADD COLUMN     "file_url" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "score_released" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
ADD COLUMN     "target" "AssignmentTarget" NOT NULL DEFAULT 'COURSE',
ADD COLUMN     "teacher_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "lesson_id" DROP NOT NULL,
ALTER COLUMN "due_date" SET NOT NULL;

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "submissions_assignment_id_student_id_key" ON "submissions"("assignment_id", "student_id");

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
