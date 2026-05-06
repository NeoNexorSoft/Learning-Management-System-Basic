/*
  Warnings:

  - You are about to drop the `question_bank` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "question_bank" DROP CONSTRAINT "question_bank_teacher_id_fkey";

-- DropTable
DROP TABLE "question_bank";

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionTextEn" TEXT,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "marks" INTEGER NOT NULL DEFAULT 1,
    "options" TEXT,
    "answer" TEXT,
    "answerBn" TEXT,
    "explanation" TEXT,
    "explanationBn" TEXT,
    "subject" TEXT,
    "topic" TEXT,
    "subtopic" TEXT,
    "hint" TEXT,
    "source" TEXT NOT NULL DEFAULT 'ai',
    "sourceReference" TEXT,
    "needEvaluation" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "hasFigure" BOOLEAN NOT NULL DEFAULT false,
    "hasFormula" BOOLEAN NOT NULL DEFAULT false,
    "bloomLevel" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subjectId" INTEGER,
    "topicId" INTEGER,
    "userId" TEXT,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
