-- CreateTable
CREATE TABLE "Internship" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "info" TEXT NOT NULL,
    "workplaceId" INTEGER NOT NULL,
    "teacherUserId" INTEGER NOT NULL,
    "studentUserId" INTEGER NOT NULL,
    "jobSupervisorUserId" INTEGER NOT NULL,

    CONSTRAINT "Internship_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_workplaceId_fkey" FOREIGN KEY ("workplaceId") REFERENCES "Workplace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_teacherUserId_fkey" FOREIGN KEY ("teacherUserId") REFERENCES "teachers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_studentUserId_fkey" FOREIGN KEY ("studentUserId") REFERENCES "students"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_jobSupervisorUserId_fkey" FOREIGN KEY ("jobSupervisorUserId") REFERENCES "job_supervisors"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
