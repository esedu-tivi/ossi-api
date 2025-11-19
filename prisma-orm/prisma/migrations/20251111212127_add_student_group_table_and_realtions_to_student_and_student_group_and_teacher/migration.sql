/*
  Warnings:

  - You are about to drop the column `group_id` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "students" DROP COLUMN "group_id",
ADD COLUMN     "studentGroupId" INTEGER;

-- CreateTable
CREATE TABLE "StudentGroup" (
    "id" SERIAL NOT NULL,
    "groupName" TEXT NOT NULL,

    CONSTRAINT "StudentGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StudentGroupToTeacher" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_StudentGroupToTeacher_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentGroup_groupName_key" ON "StudentGroup"("groupName");

-- CreateIndex
CREATE INDEX "_StudentGroupToTeacher_B_index" ON "_StudentGroupToTeacher"("B");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_studentGroupId_fkey" FOREIGN KEY ("studentGroupId") REFERENCES "StudentGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentGroupToTeacher" ADD CONSTRAINT "_StudentGroupToTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "StudentGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentGroupToTeacher" ADD CONSTRAINT "_StudentGroupToTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "teachers"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
