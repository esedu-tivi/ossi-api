-- XP + kirjautumislogit opettajanäkymän demoa varten
ALTER TABLE "students" ADD COLUMN "xp" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "student_login_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "logged_in_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_login_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "student_login_logs_user_id_logged_in_at_idx" ON "student_login_logs"("user_id", "logged_in_at" DESC);

ALTER TABLE "student_login_logs" ADD CONSTRAINT "student_login_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
