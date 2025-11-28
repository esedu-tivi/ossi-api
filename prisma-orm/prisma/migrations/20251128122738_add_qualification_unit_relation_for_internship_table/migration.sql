-- AlterTable
ALTER TABLE "Internship" ADD COLUMN     "qualificationUnitId" INTEGER;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_qualificationUnitId_fkey" FOREIGN KEY ("qualificationUnitId") REFERENCES "qualification_units"("eperuste_id") ON DELETE SET NULL ON UPDATE CASCADE;
