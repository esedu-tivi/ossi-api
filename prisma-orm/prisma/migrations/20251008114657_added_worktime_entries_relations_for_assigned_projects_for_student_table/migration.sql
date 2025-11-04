-- AddForeignKey
ALTER TABLE "public"."student_worktime_tracker" ADD CONSTRAINT "student_worktime_tracker_student_id_project_id_fkey" FOREIGN KEY ("student_id", "project_id") REFERENCES "public"."assigned_projects_for_students"("student_id", "project_id") ON DELETE RESTRICT ON UPDATE CASCADE;
