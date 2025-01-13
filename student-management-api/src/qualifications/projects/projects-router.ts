import express from "express";
import { QualificationProject, QualificationProjectTag, QualificationProjectTagLinks, QualificationUnitPart } from "sequelize-models";

const router = express();

router.get("/tags", async (req, res) => {
    const tags = await QualificationProjectTag.findAll();

    res.json(tags);
});

router.post("/tags", async (req, res) => {
    const tagName = req.body.tagName

    const tag = await QualificationProjectTag.create({
        name: tagName
    });

    res.json(tag);
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
    
    const createdProject = await QualificationProject.create({
        name: project.name,
        description: project.description,
        materials: project.materials,
        duration: project.duration,
        isActive: project.isActive,
    });
    
    if (project.tags != undefined && project.tags.length > 0) {
        project.tags.forEach(async tagId => {
            const tag = await QualificationProjectTag.findByPk(tagId);

            if (tag === null)
                // rollback transaction
                throw Error();

            createdProject.addTag(tag)
        });
    }

    res.json(createdProject);
});

router.put("/:id", async (req, res) => {
    const updatedProjectFields = req.body;

    const updatedProject = await QualificationProject.findByPk(req.params.id, {
        include: [QualificationProject.associations.tags]
    });
    
    await updatedProject.update({
        name: updatedProjectFields.name,
        description: updatedProjectFields.description,
        materials: updatedProjectFields.materials,
        duration: updatedProjectFields.duration,
        isActive: updatedProjectFields.isActive,
    });

    const existingTags = await QualificationProjectTag.findAll({
        include: {
            association: QualificationProjectTag.associations.projects,
            where: {
                id: req.params.id,
            }
        }
    });

    const tagsToRemove = existingTags.filter(tag => !updatedProjectFields.tags.includes(tag.id));
    const tagIdsToAdd = [...new Set(existingTags.filter(tag => updatedProjectFields.tags.includes(tag.id)).map(tag => tag.id).concat(updatedProjectFields.tags))];

    await QualificationProjectTagLinks.destroy({
        where: {
            qualificationProjectId: req.params.id,
            qualificationProjectTagId: tagsToRemove.map(tag => tag.id)
        }
    });

    await QualificationProjectTagLinks.bulkCreate(tagIdsToAdd.map(tagId => ({
        qualificationProjectTagId: tagId,
        qualificationProjectId: Number(req.params.id)
    })));

    await updatedProject.reload();

    res.json(updatedProject);
});

export const ProjectsRouter = router;
