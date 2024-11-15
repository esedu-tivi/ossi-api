import express from "express";
import { pool } from "../../postgres-pool.js";

const router = express();

router.get("/", async (req, res) => {
    const queryResponse = await pool.query("SELECT id, qualification_unit_id, name FROM qualification_unit_parts;");

    res.json(queryResponse.rows);
});

router.get("/:id", async (req, res) => {
    const queryResponse = await pool.query("SELECT id, qualification_unit_id, name FROM qualification_unit_parts WHERE id = $1;", [req.params.id]);

    res.json(queryResponse.rows[0]);
});

router.get("/:id/projects", async (req, res) => {
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

router.get("/:id/parent_qualification_unit", async (req, res) => {
    // TODO

    res.status(400);
});

router.post("/", async (req, res) => {
    const part = req.body;

    // TODO should use transaction
    const queryResponse = await pool.query(`
        INSERT INTO
            qualification_unit_parts(
                qualification_unit_id,
                name
            )
        VALUES (
            $1,
            $2
        )
        RETURNING
            id, name
    ;`, [part.parentQualificationUnit, part.name]);
    
    if (part.projects != undefined && part.projects.length > 0) {
        part.projects.forEach(async projectId => {
            await pool.query(`
                INSERT INTO
                    qualification_projects_parts_relations(
                        qualification_project_id,
                        qualification_unit_part_id
                    )
                VALUES (
                    $1,
                    $2
                )
            ;`, [projectId, queryResponse.rows[0].id]);
        });
    }

    res.json(queryResponse.rows[0]);
});

router.put("/", async (req, res) => {

});

export const PartsRouter = router;
