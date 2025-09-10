-- CreateEnum
CREATE TYPE "public"."enum_assigned_projects_for_students_project_status" AS ENUM ('WORKING', 'RETURNED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."enum_students_qualification_completion" AS ENUM ('FULL_COMPLETION', 'PARTIAL_COMPLETION');

-- CreateEnum
CREATE TYPE "public"."enum_users_scope" AS ENUM ('STUDENT', 'TEACHER', 'JOB_SUPERVISOR', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."SequelizeMeta" (
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "public"."assigned_projects_for_students" (
    "student_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "deadline_date" TIMESTAMPTZ(6),
    "project_plan" TEXT,
    "project_report" TEXT,
    "teacher_comment" TEXT,
    "project_status" "public"."enum_assigned_projects_for_students_project_status" DEFAULT 'WORKING',

    CONSTRAINT "assigned_projects_for_students_pkey" PRIMARY KEY ("student_id","project_id")
);

-- CreateTable
CREATE TABLE "public"."assigned_qualification_units_for_students" (
    "student_id" INTEGER NOT NULL,
    "qualification_unit_id" INTEGER,

    CONSTRAINT "assigned_qualification_units_for_students_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "public"."competence_requirements_in_projects" (
    "qualification_project_id" INTEGER NOT NULL,
    "qualification_competence_requirement_id" INTEGER NOT NULL,

    CONSTRAINT "competence_requirements_in_projects_pkey" PRIMARY KEY ("qualification_project_id","qualification_competence_requirement_id")
);

-- CreateTable
CREATE TABLE "public"."job_supervisors" (
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "job_supervisors_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."mandatory_qualification_units_for_title" (
    "unit_id" INTEGER NOT NULL,
    "title_id" INTEGER NOT NULL,

    CONSTRAINT "mandatory_qualification_units_for_title_pkey" PRIMARY KEY ("unit_id","title_id")
);

-- CreateTable
CREATE TABLE "public"."qualification_competence_requirement" (
    "eperuste_id" INTEGER NOT NULL,
    "group_id" INTEGER,
    "description" VARCHAR(1024),

    CONSTRAINT "qualification_competence_requirement_pkey" PRIMARY KEY ("eperuste_id")
);

-- CreateTable
CREATE TABLE "public"."qualification_competence_requirements" (
    "eperuste_id" INTEGER NOT NULL,
    "title" VARCHAR(128),
    "qualification_unit_id" INTEGER,

    CONSTRAINT "qualification_competence_requirements_pkey" PRIMARY KEY ("eperuste_id")
);

-- CreateTable
CREATE TABLE "public"."qualification_project_tags" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(128),

    CONSTRAINT "qualification_project_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."qualification_projects" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(128),
    "description" VARCHAR(1024),
    "materials" VARCHAR(1024),
    "duration" INTEGER,
    "is_active" BOOLEAN,

    CONSTRAINT "qualification_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."qualification_projects_parts_relations" (
    "qualification_project_id" INTEGER NOT NULL,
    "qualification_unit_part_id" INTEGER NOT NULL,
    "part_order_index" INTEGER,

    CONSTRAINT "qualification_projects_parts_relations_pkey" PRIMARY KEY ("qualification_project_id","qualification_unit_part_id")
);

-- CreateTable
CREATE TABLE "public"."qualification_projects_tags_relations" (
    "qualification_project_id" INTEGER NOT NULL,
    "qualification_project_tag_id" INTEGER NOT NULL,

    CONSTRAINT "qualification_projects_tags_relations_pkey" PRIMARY KEY ("qualification_project_id","qualification_project_tag_id")
);

-- CreateTable
CREATE TABLE "public"."qualification_titles" (
    "eperuste_id" INTEGER NOT NULL,
    "qualification_id" INTEGER,
    "name" VARCHAR(256),

    CONSTRAINT "qualification_titles_pkey" PRIMARY KEY ("eperuste_id")
);

-- CreateTable
CREATE TABLE "public"."qualification_unit_parts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(128),
    "description" TEXT,
    "materials" TEXT,
    "qualification_unit_id" INTEGER,
    "unit_order_index" INTEGER,

    CONSTRAINT "qualification_unit_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."qualification_units" (
    "eperuste_id" INTEGER NOT NULL,
    "qualification_id" INTEGER,
    "name" VARCHAR(128),
    "scope" INTEGER,

    CONSTRAINT "qualification_units_pkey" PRIMARY KEY ("eperuste_id")
);

-- CreateTable
CREATE TABLE "public"."qualifications" (
    "eperuste_id" INTEGER NOT NULL,
    "name" VARCHAR(128),

    CONSTRAINT "qualifications_pkey" PRIMARY KEY ("eperuste_id")
);

-- CreateTable
CREATE TABLE "public"."student_worktime_tracker" (
    "student_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "public"."students" (
    "user_id" INTEGER NOT NULL,
    "group_id" VARCHAR(128) NOT NULL,
    "qualification_title_id" INTEGER,
    "qualification_id" INTEGER,
    "qualification_completion" "public"."enum_students_qualification_completion",

    CONSTRAINT "students_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."supervised_students_by_job_supervisors" (
    "student_id" INTEGER,
    "job_supervisor_id" INTEGER
);

-- CreateTable
CREATE TABLE "public"."teachers" (
    "user_id" INTEGER NOT NULL,
    "teachingQualificationTitleId" INTEGER,
    "teachingQualificationId" INTEGER,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(128) NOT NULL,
    "last_name" VARCHAR(128) NOT NULL,
    "email" VARCHAR(128) NOT NULL,
    "phone_number" VARCHAR(128) NOT NULL,
    "scope" "public"."enum_users_scope" NOT NULL,
    "archived" BOOLEAN DEFAULT false,
    "oid" UUID NOT NULL,
    "is_set_up" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_oid_key" ON "public"."users"("oid");

-- AddForeignKey
ALTER TABLE "public"."assigned_projects_for_students" ADD CONSTRAINT "fkey_projectId_studentProject" FOREIGN KEY ("project_id") REFERENCES "public"."qualification_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assigned_qualification_units_for_students" ADD CONSTRAINT "assigned_qualification_units_for_stu_qualification_unit_id_fkey" FOREIGN KEY ("qualification_unit_id") REFERENCES "public"."qualification_units"("eperuste_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."assigned_qualification_units_for_students" ADD CONSTRAINT "assigned_qualification_units_for_students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."job_supervisors" ADD CONSTRAINT "job_supervisors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."mandatory_qualification_units_for_title" ADD CONSTRAINT "mandatory_qualification_units_for_title_title_id_fkey" FOREIGN KEY ("title_id") REFERENCES "public"."qualification_titles"("eperuste_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."mandatory_qualification_units_for_title" ADD CONSTRAINT "mandatory_qualification_units_for_title_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."qualification_units"("eperuste_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."qualification_competence_requirements" ADD CONSTRAINT "qualification_competence_requirement_qualification_unit_id_fkey" FOREIGN KEY ("qualification_unit_id") REFERENCES "public"."qualification_units"("eperuste_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."qualification_projects_parts_relations" ADD CONSTRAINT "qualification_projects_parts_re_qualification_unit_part_id_fkey" FOREIGN KEY ("qualification_unit_part_id") REFERENCES "public"."qualification_unit_parts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."qualification_projects_parts_relations" ADD CONSTRAINT "qualification_projects_parts_rela_qualification_project_id_fkey" FOREIGN KEY ("qualification_project_id") REFERENCES "public"."qualification_projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."qualification_projects_tags_relations" ADD CONSTRAINT "qualification_projects_tags_r_qualification_project_tag_id_fkey" FOREIGN KEY ("qualification_project_tag_id") REFERENCES "public"."qualification_project_tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."qualification_projects_tags_relations" ADD CONSTRAINT "qualification_projects_tags_relat_qualification_project_id_fkey" FOREIGN KEY ("qualification_project_id") REFERENCES "public"."qualification_projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."qualification_titles" ADD CONSTRAINT "qualification_titles_qualification_id_fkey" FOREIGN KEY ("qualification_id") REFERENCES "public"."qualifications"("eperuste_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."qualification_unit_parts" ADD CONSTRAINT "qualification_unit_parts_qualification_unit_id_fkey" FOREIGN KEY ("qualification_unit_id") REFERENCES "public"."qualification_units"("eperuste_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."supervised_students_by_job_supervisors" ADD CONSTRAINT "supervised_students_by_job_supervisors_job_supervisor_id_fkey" FOREIGN KEY ("job_supervisor_id") REFERENCES "public"."job_supervisors"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."supervised_students_by_job_supervisors" ADD CONSTRAINT "supervised_students_by_job_supervisors_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."teachers" ADD CONSTRAINT "teachers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
