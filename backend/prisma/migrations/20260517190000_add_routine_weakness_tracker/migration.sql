-- CreateEnum
CREATE TYPE "WeaknessLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "RoutinePlanStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RoutineTaskStatus" AS ENUM ('PENDING', 'UPCOMING', 'COMPLETED', 'MISSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RoutineTaskType" AS ENUM ('READING', 'PRACTICE', 'REVISION', 'TEST', 'ASSIGNMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "TrackerRecommendationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "weakness_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weakness_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_weaknesses" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "level" "WeaknessLevel" NOT NULL DEFAULT 'LOW',
    "note" TEXT,
    "identified_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_weaknesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_plans" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" "RoutinePlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routine_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_tasks" (
    "id" TEXT NOT NULL,
    "routine_plan_id" TEXT,
    "student_id" TEXT NOT NULL,
    "category_id" TEXT,
    "subject" TEXT NOT NULL,
    "topic" TEXT,
    "task_type" "RoutineTaskType" NOT NULL DEFAULT 'READING',
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "status" "RoutineTaskStatus" NOT NULL DEFAULT 'UPCOMING',
    "note" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routine_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_task_logs" (
    "id" TEXT NOT NULL,
    "routine_task_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" "RoutineTaskStatus" NOT NULL,
    "completed_at" TIMESTAMP(3),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_task_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracker_recommendations" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "category_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "TrackerRecommendationPriority" NOT NULL DEFAULT 'MEDIUM',
    "action_label" TEXT,
    "resource_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tracker_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracker_feedbacks" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "teacher_id" TEXT,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tracker_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "weakness_categories_name_key" ON "weakness_categories"("name");
CREATE INDEX "weakness_categories_is_active_idx" ON "weakness_categories"("is_active");
CREATE UNIQUE INDEX "student_weaknesses_student_id_category_id_key" ON "student_weaknesses"("student_id", "category_id");
CREATE INDEX "student_weaknesses_student_id_idx" ON "student_weaknesses"("student_id");
CREATE INDEX "student_weaknesses_category_id_idx" ON "student_weaknesses"("category_id");
CREATE INDEX "student_weaknesses_level_idx" ON "student_weaknesses"("level");
CREATE INDEX "routine_plans_student_id_idx" ON "routine_plans"("student_id");
CREATE INDEX "routine_plans_status_idx" ON "routine_plans"("status");
CREATE INDEX "routine_plans_start_date_idx" ON "routine_plans"("start_date");
CREATE INDEX "routine_tasks_student_id_idx" ON "routine_tasks"("student_id");
CREATE INDEX "routine_tasks_routine_plan_id_idx" ON "routine_tasks"("routine_plan_id");
CREATE INDEX "routine_tasks_category_id_idx" ON "routine_tasks"("category_id");
CREATE INDEX "routine_tasks_date_idx" ON "routine_tasks"("date");
CREATE INDEX "routine_tasks_status_idx" ON "routine_tasks"("status");
CREATE INDEX "routine_task_logs_routine_task_id_idx" ON "routine_task_logs"("routine_task_id");
CREATE INDEX "routine_task_logs_student_id_idx" ON "routine_task_logs"("student_id");
CREATE INDEX "routine_task_logs_status_idx" ON "routine_task_logs"("status");
CREATE INDEX "tracker_recommendations_student_id_idx" ON "tracker_recommendations"("student_id");
CREATE INDEX "tracker_recommendations_category_id_idx" ON "tracker_recommendations"("category_id");
CREATE INDEX "tracker_recommendations_priority_idx" ON "tracker_recommendations"("priority");
CREATE INDEX "tracker_recommendations_is_active_idx" ON "tracker_recommendations"("is_active");
CREATE INDEX "tracker_feedbacks_student_id_idx" ON "tracker_feedbacks"("student_id");
CREATE INDEX "tracker_feedbacks_teacher_id_idx" ON "tracker_feedbacks"("teacher_id");

-- AddForeignKey
ALTER TABLE "student_weaknesses" ADD CONSTRAINT "student_weaknesses_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_weaknesses" ADD CONSTRAINT "student_weaknesses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "weakness_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_weaknesses" ADD CONSTRAINT "student_weaknesses_identified_by_id_fkey" FOREIGN KEY ("identified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "routine_plans" ADD CONSTRAINT "routine_plans_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "routine_plans" ADD CONSTRAINT "routine_plans_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "routine_tasks" ADD CONSTRAINT "routine_tasks_routine_plan_id_fkey" FOREIGN KEY ("routine_plan_id") REFERENCES "routine_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "routine_tasks" ADD CONSTRAINT "routine_tasks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "routine_tasks" ADD CONSTRAINT "routine_tasks_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "weakness_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "routine_tasks" ADD CONSTRAINT "routine_tasks_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "routine_task_logs" ADD CONSTRAINT "routine_task_logs_routine_task_id_fkey" FOREIGN KEY ("routine_task_id") REFERENCES "routine_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "routine_task_logs" ADD CONSTRAINT "routine_task_logs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tracker_recommendations" ADD CONSTRAINT "tracker_recommendations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tracker_recommendations" ADD CONSTRAINT "tracker_recommendations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "weakness_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tracker_recommendations" ADD CONSTRAINT "tracker_recommendations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tracker_feedbacks" ADD CONSTRAINT "tracker_feedbacks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tracker_feedbacks" ADD CONSTRAINT "tracker_feedbacks_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
