-- AlterTable
ALTER TABLE "lesson_quizzes" ADD COLUMN "timer_seconds" INTEGER,
ADD COLUMN "deadline" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "quiz_attempts" ADD COLUMN "started_at" TIMESTAMP(3),
ADD COLUMN "time_taken_seconds" INTEGER,
ADD COLUMN "is_late" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "submitted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "quiz_attempts_quiz_id_student_id_key" ON "quiz_attempts"("quiz_id", "student_id");
