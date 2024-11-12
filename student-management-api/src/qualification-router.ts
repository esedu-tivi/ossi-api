import express from "express";
import { pool } from "./postgres-pool.js";

const router = express();

router.get("/projects", async (req, res) => {
    const queryResponse = await pool.query("SELECT id, name FROM qualification_projects;");

    return queryResponse.rows;
});

router.get("/projects/:id/linked_qualification_unit_parts", async (req, res) => {
    const queryResponse = await pool.query(`
        SELECT
            qualification_unit_parts.id,
            qualification_unit_parts.qualification_unit_id as \"qualificationUnitId\", 
            qualification_unit_parts.name
        FROM 
            qualification_unit_parts
        INNER JOIN 
            qualification_projects_parts_relations
                ON qualification_projects_parts_relations.qualification_unit_part_id = qualification_unit_parts.id
        WHERE
            qualification_projects_parts_relations.qualification_project_id = $1
        ;`, [req.params.id]);

    return queryResponse.rows;
});

router.get("/parts", async (req, res) => {
    const queryResponse = await pool.query("SELECT id, qualification_unit_id, name FROM qualification_unit_parts;");

    return queryResponse.rows;
});

router.get("/parts/:id/projects", async (req, res) => {
    const queryResponse = await pool.query(`
        SELECT
            qualification_projects.id
            qualfiication_projects.name
        FROM
            qualification_projects
        INNER JOIN
            ON qualification_projects_parts_relations.qualfication_project_id = qualification_projects.id
        WHERE
            qualification_projects_parts_relations.qualification_unit_part_id = $1
        ;`, [req.params.id]);
});

router.post("/projects", async (req, res) => {
    // create project
});

router.post("/parts", async (req, res) => {
    // create part
});

export const QualificationRouter = router;
