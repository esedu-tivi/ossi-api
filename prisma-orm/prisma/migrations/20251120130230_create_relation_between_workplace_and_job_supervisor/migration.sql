-- AlterTable
ALTER TABLE "job_supervisors" ADD COLUMN     "workplaceId" INTEGER;

-- AddForeignKey
ALTER TABLE "job_supervisors" ADD CONSTRAINT "job_supervisors_workplaceId_fkey" FOREIGN KEY ("workplaceId") REFERENCES "Workplace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
