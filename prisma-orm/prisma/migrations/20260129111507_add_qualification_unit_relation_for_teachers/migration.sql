-- CreateTable
CREATE TABLE "_QualificationUnitToTeacher" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_QualificationUnitToTeacher_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_QualificationUnitToTeacher_B_index" ON "_QualificationUnitToTeacher"("B");

-- AddForeignKey
ALTER TABLE "_QualificationUnitToTeacher" ADD CONSTRAINT "_QualificationUnitToTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "qualification_units"("eperuste_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QualificationUnitToTeacher" ADD CONSTRAINT "_QualificationUnitToTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "teachers"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
