-- tutkinto
CREATE TABLE qualifications (
    eperuste_id integer PRIMARY KEY,
    name text
);

-- ammattinimike
CREATE TABLE qualification_titles (
    eperuste_id integer PRIMARY KEY,
    qualification_id integer REFERENCES qualifications NOT NULL,
    name text
);

-- tutkinnonosa
CREATE TABLE qualification_units (
    eperuste_id integer PRIMARY KEY,
    qualification_id integer REFERENCES qualifications NOT NULL,
    scope int,
    name text
);

--CREATE TABLE undertaken_qualification_unit_for_student (
--    student_id integer NOT NULL REFERENCES students,
--    qualification_unit_id integer NOT NULL REFERENCES qualification_units
--);

CREATE TYPE user_authority_scope AS ENUM ('student', 'teacher', 'job supervisor', 'admin');

CREATE TABLE users (
    id integer PRIMARY KEY,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone_number text NOT NULL,
    scope user_authority_scope NOT NULL,
    archived boolean DEFAULT FALSE
);

--CREATE TABLE student_qualifications (
--    user_id integer PRIMARY KEY REFERENCES students,
--);

CREATE TABLE students (
    user_id integer PRIMARY KEY REFERENCES users,
    group_id text NOT NULL,
    qualification_title_id INT REFERENCES qualification_titles,
    qualification_id integer NOT NULL REFERENCES qualifications
);

CREATE TABLE teachers (
    user_id integer PRIMARY KEY REFERENCES users,
    teaching_qualification_id integer REFERENCES qualifications NOT NULL,
    teaching_qualification_title_id integer REFERENCES qualification_titles NOT NULL
);

CREATE TABLE job_supervisors (
    user_id integer PRIMARY KEY REFERENCES users
);

CREATE TABLE supervised_students_by_job_supervisors (
    job_supervisor_id integer REFERENCES job_supervisors,
    student_id integer REFERENCES students
);

INSERT INTO users(id, first_name, last_name, email, phone_number, scope) VALUES(1, 'etunimi', 'sukunimi', 'sposti@localhost.fi', '+358123456789', 'student');

INSERT INTO qualifications(eperuste_id, name) VALUES(7861752, 'Tieto- ja viestintätekniikan perustutkinto');
INSERT INTO qualification_titles(eperuste_id, qualification_id, name) VALUES(10224, 7861752, 'Ohjelmistokehittäjä');
INSERT INTO students(user_id, group_id, qualification_title_id, qualification_id) VALUES(1, 'TiVi23A', 10224, 7861752);