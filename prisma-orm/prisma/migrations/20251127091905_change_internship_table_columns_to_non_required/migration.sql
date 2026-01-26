-- DropForeignKey
ALTER TABLE "Internship" DROP CONSTRAINT "Internship_jobSupervisorUserId_fkey";

-- DropForeignKey
ALTER TABLE "Internship" DROP CONSTRAINT "Internship_studentUserId_fkey";

-- DropForeignKey
ALTER TABLE "Internship" DROP CONSTRAINT "Internship_teacherUserId_fkey";

-- DropForeignKey
ALTER TABLE "Internship" DROP CONSTRAINT "Internship_workplaceId_fkey";

-- AlterTable
ALTER TABLE "Internship" ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "info" DROP NOT NULL,
ALTER COLUMN "workplaceId" DROP NOT NULL,
ALTER COLUMN "teacherUserId" DROP NOT NULL,
ALTER COLUMN "studentUserId" DROP NOT NULL,
ALTER COLUMN "jobSupervisorUserId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_workplaceId_fkey" FOREIGN KEY ("workplaceId") REFERENCES "Workplace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_teacherUserId_fkey" FOREIGN KEY ("teacherUserId") REFERENCES "teachers"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_studentUserId_fkey" FOREIGN KEY ("studentUserId") REFERENCES "students"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_jobSupervisorUserId_fkey" FOREIGN KEY ("jobSupervisorUserId") REFERENCES "job_supervisors"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
