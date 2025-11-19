-- CreateTable
CREATE TABLE "_QualificationProjectTagToTeacher" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_QualificationProjectTagToTeacher_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_QualificationProjectTagToTeacher_B_index" ON "_QualificationProjectTagToTeacher"("B");

-- AddForeignKey
ALTER TABLE "_QualificationProjectTagToTeacher" ADD CONSTRAINT "_QualificationProjectTagToTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "qualification_project_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QualificationProjectTagToTeacher" ADD CONSTRAINT "_QualificationProjectTagToTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "teachers"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
