/*
  Warnings:

  - Added the required column `id` to the `supervised_students_by_job_supervisors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "supervised_students_by_job_supervisors" ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "supervised_students_by_job_supervisors_pkey" PRIMARY KEY ("id");
