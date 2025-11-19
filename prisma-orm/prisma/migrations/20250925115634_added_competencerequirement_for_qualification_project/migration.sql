-- AlterTable
ALTER TABLE "public"."qualification_projects" ADD COLUMN     "competenceRequirementId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."qualification_projects" ADD CONSTRAINT "qualification_projects_competenceRequirementId_fkey" FOREIGN KEY ("competenceRequirementId") REFERENCES "public"."qualification_competence_requirement"("eperuste_id") ON DELETE SET NULL ON UPDATE CASCADE;
