import express from "express";
import { pool } from "../../postgres-pool.js";
import { QualificationProject, QualificationProjectTag, QualificationUnitPart } from "sequelize-models";

const router = express();

router.get("/tags", async (req, res) => {
    const tags = await QualificationProjectTag.findAll();

    res.json(tags);
});

router.post("/tags", async (req, res) => {
    const tagName = req.body.tagName

    const queryResponse = await pool.query(`
        INSERT INTO
            qualification_project_tags(
                name
            )
        VALUES (
            $1
        )
        RETURNING id, name
    ;`, [tagName]);

    res.json(queryResponse.rows[0]);
});

router.get("/", async (req, res) => {
    const projects = await QualificationProject.findAll({
        include: [QualificationProject.associations.tags]
    });

    res.json(projects);
});

router.get("/:id", async (req, res) => {
    const project = await QualificationProject.findOne({
        where: {
            id: req.params.id
        },
        include: [QualificationProject.associations.tags]
    });

    res.json(project);
});

router.get("/:id/linked_qualification_unit_parts", async (req, res) => {
    const unitParts = await QualificationUnitPart.findAll({
        include: [{
            association: QualificationUnitPart.associations.projects,
            where: {
                id: req.params.id
            }
        }]
    })

    res.json(unitParts);
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
        WHERE
            id = $6
        RETURNING
            *, is_active as \"isActive\"
    ;`, [project.name, project.description, project.materials, project.duration, project.isActive, req.params.id]);

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
