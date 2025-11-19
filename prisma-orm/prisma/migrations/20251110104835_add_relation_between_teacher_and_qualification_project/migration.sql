-- CreateTable
CREATE TABLE "_QualificationProjectToTeacher" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_QualificationProjectToTeacher_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_QualificationProjectToTeacher_B_index" ON "_QualificationProjectToTeacher"("B");

-- AddForeignKey
ALTER TABLE "_QualificationProjectToTeacher" ADD CONSTRAINT "_QualificationProjectToTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "qualification_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QualificationProjectToTeacher" ADD CONSTRAINT "_QualificationProjectToTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "teachers"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
