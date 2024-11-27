import express from "express";
import { pool } from "../../postgres-pool.js";

const router = express();

router.get("/", async (req, res) => {
    const queryResponse = await pool.query("SELECT id, name, materials, duration, is_active as \"isActive\" FROM qualification_projects;");

    res.json(queryResponse.rows);
});

router.get("/:id", async (req, res) => {
    const queryResponse = await pool.query("SELECT id, name, materials, duration, is_active as \"isActive\" FROM qualification_projects WHERE id = $1;", [req.params.id]);

    res.json(queryResponse.rows[0]);
});

router.get("/:id/description", async (req, res) => {
    const queryResponse = await pool.query("SELECT description FROM qualification_projects WHERE id = $1;", [req.params.id]);

    res.json(queryResponse.rows[0]);
});

router.get("/:id/linked_qualification_unit_parts", async (req, res) => {
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

router.get("/:id/tags", async (req, res) => {
    const queryResponse = await pool.query(`
        SELECT
            qualification_project_tags.id,
            qualification_project_tags.name
        FROM
            qualification_project_tags
        INNER JOIN
            qualification_projects_tags_relations
                ON qualification_projects_tags_relations.qualification_project_tag_id = qualification_project_tags.id
        WHERE
            qualification_projects_tags_relations.qualification_project_id = $1
    ;`, [req.params.id]);

    res.json(queryResponse.rows);
});

router.post("/", async (req, res) => {
    const project = req.body;

    const queryResponse = await pool.query(`
        INSERT INTO 
            qualification_projects(
                name,
                description,
                materials,
                duration,
                is_active
            )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5
        )
        RETURNING
            *, is_active as \"isActive\"
    ;`, [project.name, project.description, project.materials, project.duration, project.isActive]);
    
    if (project.tags != undefined && project.tags.length > 0) {
        project.tags.forEach(async tagId => {
            await pool.query(`
                INSERT INTO
                    qualification_projects_tags_relations(
                        qualification_project_tag_id,
                        qualification_project_id
                    )
                VALUES (
                    $1,
                    $2
                )
            ;`, [tagId, queryResponse.rows[0].id]);
        });
    }

    res.json(queryResponse.rows[0]);
});

router.put("/:id", async (req, res) => {
    const project = req.body;

    const queryResponse = await pool.query(`
        UPDATE
            qualification_projects
        SET
            name = $1,
            description = $2,
            materials = $3,
            duration = $4,
            is_active = $5
        RETURNING
            *, is_active as \"isActive\"
    ;`, [project.name, project.description, project.materials, project.duration, project.isActive]);

    const existingTags = (await pool.query(`SELECT qualification_project_tag_id AS \"qualificationProjectTagId\" FROM qualification_projects_tags_relations WHERE qualification_project_id = $1;`, [req.params.id])).rows.map(row => row.qualificationProjectTagId);
    
    const tagsToRemove = existingTags.filter(tagId => !project.tags.includes(tagId))
    const tagsToAdd = [...new Set(existingTags.filter(tagId => project.tags.includes(tagId)).concat(project.tags))]

    tagsToRemove.forEach(tagId => {
        pool.query(`
            DELETE FROM
                qualification_projects_tags_relations
            WHERE
                qualification_project_tag_id = $1
                AND qualification_project_id = $2
        ;`, [tagId, req.params.id]);
    });

    tagsToAdd.forEach(async tagId => {
        await pool.query(`
            INSERT INTO
                qualification_projects_tags_relations(
                    qualification_project_tag_id,
                    qualification_project_id
                )
            VALUES (
                $1,
                $2
            )
        ;`, [tagId, req.params.id]);
    });

    res.json(queryResponse.rows[0]);
});

export const ProjectsRouter = router;
