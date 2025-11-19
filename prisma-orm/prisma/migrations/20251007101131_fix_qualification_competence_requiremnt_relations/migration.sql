/*
  Warnings:

  - You are about to drop the column `qualificationCompetenceRequirementsId` on the `qualification_competence_requirement` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."qualification_competence_requirement" DROP CONSTRAINT "qualification_competence_requirement_qualificationCompeten_fkey";

-- AlterTable
ALTER TABLE "public"."qualification_competence_requirement" DROP COLUMN "qualificationCompetenceRequirementsId";

-- AlterTable
ALTER TABLE "public"."qualification_competence_requirements" ADD COLUMN     "requirementId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."qualification_competence_requirement" ADD CONSTRAINT "qualification_competence_requirement_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."qualification_competence_requirements"("eperuste_id") ON DELETE SET NULL ON UPDATE CASCADE;
