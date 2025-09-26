/*
  Warnings:

  - You are about to drop the column `competenceRequirementId` on the `qualification_projects` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."qualification_projects" DROP CONSTRAINT "qualification_projects_competenceRequirementId_fkey";

-- AlterTable
ALTER TABLE "public"."qualification_projects" DROP COLUMN "competenceRequirementId";

-- CreateTable
CREATE TABLE "public"."_QualificationCompetenceRequirementToQualificationProject" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_QualificationCompetenceRequirementToQualificationProje_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_QualificationCompetenceRequirementToQualificationProje_B_index" ON "public"."_QualificationCompetenceRequirementToQualificationProject"("B");

-- AddForeignKey
ALTER TABLE "public"."_QualificationCompetenceRequirementToQualificationProject" ADD CONSTRAINT "_QualificationCompetenceRequirementToQualificationProjec_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."qualification_competence_requirement"("eperuste_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_QualificationCompetenceRequirementToQualificationProject" ADD CONSTRAINT "_QualificationCompetenceRequirementToQualificationProjec_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."qualification_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
