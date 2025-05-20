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

-- teema
-- TODO check compatibility with old table
CREATE TABLE qualification_unit_parts (
    id serial PRIMARY KEY,
    qualification_unit_id integer REFERENCES qualification_units NOT NULL,
    unit_order_index integer NOT NULL,
    name text,
    description text,
    materials text
);

-- projekti
CREATE TABLE qualification_projects (
    id serial PRIMARY KEY,
    name text,
    description text,
    materials text,
    duration int,
    is_active boolean
    -- store this in a seperate database with diffs
    -- description text
);

CREATE TABLE qualification_project_tags (
    id serial PRIMARY KEY,
    name text
);

-- competence requirement tables are populated lazily from ePeruste
CREATE TABLE qualification_competence_requirements (
    eperuste_id integer PRIMARY KEY,
    qualification_unit_id integer NOT NULL REFERENCES qualification_units,
    title text NOT NULL
);

CREATE TABLE qualification_competence_requirement (
    eperuste_id integer PRIMARY KEY,
    group_id integer NOT NULL REFERENCES qualification_competence_requirements,
    description text NOT NULL
);

CREATE TABLE competence_requirements_in_projects (
    qualification_project_id integer NOT NULL REFERENCES qualification_projects,
    qualification_competence_requirement_id integer NOT NULL REFERENCES qualification_competence_requirement
);

CREATE TABLE qualification_projects_tags_relations (
    qualification_project_id integer NOT NULL REFERENCES qualification_projects,
    qualification_project_tag_id integer NOT NULL REFERENCES qualification_project_tags
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE qualification_projects_parts_relations (
    qualification_project_id integer REFERENCES qualification_projects NOT NULL,
    qualification_unit_part_id integer REFERENCES qualification_unit_parts NOT NULL,
    part_order_index integer NOT NULL
);

CREATE TYPE user_authority_scope AS ENUM ('student', 'teacher', 'job supervisor', 'admin');

CREATE SEQUENCE users_id_seq START WITH 2;

CREATE TABLE users (
    id integer PRIMARY KEY DEFAULT nextval('users_id_seq'),
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL UNIQUE,
    phone_number text NOT NULL,
    scope user_authority_scope NOT NULL,
    archived boolean DEFAULT FALSE
);

--CREATE TABLE student_qualifications (
--    user_id integer PRIMARY KEY REFERENCES students,
--);

CREATE TABLE students (
    user_id integer PRIMARY KEY REFERENCES users, -- unique
    group_id text NOT NULL,
    qualification_title_id INT REFERENCES qualification_titles,
    qualification_id integer NOT NULL REFERENCES qualifications
);

-- CREATE TABLE student_projects (
--     student_id integer REFERENCES students,
--     project_id integer REFERENCES qualification_projects
-- );

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

INSERT INTO qualification_project_tags(name) VALUES('Ohjelmointi');
INSERT INTO qualification_project_tags(name) VALUES('Ryhmätyö');
INSERT INTO qualification_project_tags(name) VALUES('Python');
INSERT INTO qualification_project_tags(name) VALUES('JavaScript');
INSERT INTO qualification_project_tags(name) Values('React');

