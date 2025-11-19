-- AlterTable
ALTER TABLE "assigned_projects_for_students" ADD COLUMN     "studentUserId" INTEGER;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "assignedProjectsForStudentStudentId" INTEGER;

-- AddForeignKey
ALTER TABLE "assigned_projects_for_students" ADD CONSTRAINT "assigned_projects_for_students_studentUserId_fkey" FOREIGN KEY ("studentUserId") REFERENCES "students"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
