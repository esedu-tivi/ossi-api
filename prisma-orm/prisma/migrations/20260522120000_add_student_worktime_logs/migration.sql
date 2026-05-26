CREATE TABLE "student_worktime_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "worktime_entry_id" INTEGER NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_worktime_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "student_worktime_logs_worktime_entry_id_key" ON "student_worktime_logs"("worktime_entry_id");

CREATE INDEX "student_worktime_logs_user_id_recorded_at_idx" ON "student_worktime_logs"("user_id", "recorded_at" DESC);

ALTER TABLE "student_worktime_logs" ADD CONSTRAINT "student_worktime_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "student_worktime_logs" ADD CONSTRAINT "student_worktime_logs_worktime_entry_id_fkey" FOREIGN KEY ("worktime_entry_id") REFERENCES "student_worktime_tracker"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
