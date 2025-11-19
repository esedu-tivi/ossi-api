-- AlterTable
ALTER TABLE "public"."student_worktime_tracker" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "student_worktime_tracker_pkey" PRIMARY KEY ("id");
