/*
  Warnings:

  - You are about to drop the `_QualificationCompetenceRequirementToQualificationProject` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_QualificationCompetenceRequirementToQualificationProject" DROP CONSTRAINT "_QualificationCompetenceRequirementToQualificationProjec_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_QualificationCompetenceRequirementToQualificationProject" DROP CONSTRAINT "_QualificationCompetenceRequirementToQualificationProjec_B_fkey";

-- AlterTable
ALTER TABLE "public"."qualification_competence_requirement" ADD COLUMN     "qualificationCompetenceRequirementsId" INTEGER,
ADD COLUMN     "qualificationProjectId" INTEGER;

-- DropTable
DROP TABLE "public"."_QualificationCompetenceRequirementToQualificationProject";

-- AddForeignKey
ALTER TABLE "public"."qualification_competence_requirement" ADD CONSTRAINT "qualification_competence_requirement_qualificationProjectI_fkey" FOREIGN KEY ("qualificationProjectId") REFERENCES "public"."qualification_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."qualification_competence_requirement" ADD CONSTRAINT "qualification_competence_requirement_qualificationCompeten_fkey" FOREIGN KEY ("qualificationCompetenceRequirementsId") REFERENCES "public"."qualification_competence_requirements"("eperuste_id") ON DELETE SET NULL ON UPDATE CASCADE;
