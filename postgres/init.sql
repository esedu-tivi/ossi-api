CREATE TABLE users (
    id integer PRIMARY KEY,
    first_name text NOT NULL,
    last_name text NOT NULL
);

CREATE TABLE students (
    id integer PRIMARY KEY REFERENCES users,
    group_id text NOT NULL,
    credits integer NOT NULL DEFAULT 0
);