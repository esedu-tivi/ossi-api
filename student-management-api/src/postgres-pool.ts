import pg from "pg";

export const pool = new pg.Pool({
    host: process.env.NODE_ENV === 'test' ? "db-test" : "db",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "postgres"
})
