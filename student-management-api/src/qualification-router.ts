import express from "express";
import { pool } from "./postgres-pool.js";

const router = express();

router.get("/projects", async (req, res) => {
    const queryResponse = await pool.query("SELECT id, name, is_active as \"isActive\" FROM qualification_projects;");

    res.json(queryResponse.rows);
});

router.get("/projects/:id/description", async (req, res) => {
    const queryResponse = await pool.query("SELECT description FROM qualification_projects WHERE id = $1;", [req.params.id]);

    res.json(queryResponse.rows[0]);
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

    res.json(queryResponse.rows);
});

router.get("/parts", async (req, res) => {
    const queryResponse = await pool.query("SELECT id, qualification_unit_id, name FROM qualification_unit_parts;");

    res.json(queryResponse.rows);
});

router.get("/parts/:id/projects", async (req, res) => {
    const queryResponse = await pool.query(`
        SELECT
            qualification_projects.id,
            qualification_projects.name,
            qualification_projects.is_active as \"isActive\"
        FROM
            qualification_projects
        INNER JOIN
            qualification_projects_parts_relations
                ON qualification_projects_parts_relations.qualification_project_id = qualification_projects.id
        WHERE
            qualification_projects_parts_relations.qualification_unit_part_id = $1
        ;`, [req.params.id]);

    res.json(queryResponse.rows);
});

router.post("/projects", async (req, res) => {
    const project = req.body;

    const queryResponse = await pool.query(`
        INSERT INTO 
            qualification_projects(
                name,
                description,
                is_active
            )
        VALUES (
            $1,
            $2,
            $3
        )
        RETURNING
            *, is_active as \"isActive\"
    ;`, [project.name, project.description, project.isActive]);

    res.json(queryResponse.rows[0]);
});

router.post("/parts", async (req, res) => {
    // create part
});

export const QualificationRouter = router;
