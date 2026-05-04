-- CreateTable
CREATE TABLE "simulations" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "provider" TEXT,
    "simulationUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simulations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "simulations_subject_idx" ON "simulations"("subject");

-- CreateIndex
CREATE INDEX "simulations_gradeLevel_idx" ON "simulations"("gradeLevel");

-- CreateIndex
CREATE INDEX "simulations_isPublished_idx" ON "simulations"("isPublished");

-- CreateIndex
CREATE INDEX "simulations_createdById_idx" ON "simulations"("createdById");

-- AddForeignKey
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
