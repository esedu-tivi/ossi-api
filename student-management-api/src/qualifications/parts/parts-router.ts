import express from "express";
import { QualificationProject, QualificationProjectPartLinks, QualificationUnitPart } from "sequelize-models";
import { QualificationUnit } from "sequelize-models/dist/qualification-unit";

const router = express();

router.get("/", async (req, res) => {
    const part = await QualificationUnitPart.findAll();

    res.json(part);
});

router.get("/:id", async (req, res) => {
    const part = await QualificationUnitPart.findOne({
        where: {
            id: req.params.id
        }
    });

    res.json(part);
});

router.get("/:id/projects", async (req, res) => {
    const projects = await QualificationProject.findAll({
        include: [{
            association: QualificationProject.associations.parts,
            where: {
                id: req.params.id
            }
        }, {
            association: QualificationProject.associations.tags
        }]
    });

    res.json(projects);
});

router.get("/:id/parent_qualification_unit", async (req, res) => {
    const qualificationUnit = await QualificationUnitPart.findByPk(req.params.id, {
        include: [QualificationUnitPart.associations.unit]
    });

    res.json(qualificationUnit.unit);
});

router.post("/", async (req, res) => {
    const partFields = req.body;

    // TODO should use transaction
    const part = await QualificationUnitPart.create({
        name: partFields.name,
        qualificationUnitId: partFields.parentQualificationUnit,
        description: partFields.description,
        materials: partFields.materials,
    });
    
    if (partFields.projects != undefined && partFields.projects.length > 0) {
        await QualificationProjectPartLinks.bulkCreate(partFields.projects.map(projectId => ({
            qualificationProjectId: projectId,
            qualificationUnitPartId: part.id
        })));
    }

    res.json(part);
});

router.put("/:id", async (req, res) => {
    const updatedPartFields = req.body;

    const updatedPart = await QualificationUnitPart.findByPk(req.params.id, {
        include: [QualificationUnitPart.associations.projects]
    });

    await updatedPart.update({
        name: updatedPartFields.name,
        qualificationUnitId: updatedPartFields.parentQualificationUnit,
        description: updatedPartFields.description,
        materials: updatedPartFields.materials,
    });

    const projectsToRemove = updatedPart.projects.filter(project => !updatedPartFields.projects.includes(project.id));
    const projectIdsToAdd = [...new Set(updatedPart.projects.filter(project => updatedPartFields.projects.includes(project.id)).map(project => project.id).concat(updatedPartFields.projects))];

    await QualificationProjectPartLinks.destroy({
        where: {
            qualificationUnitPartId: req.params.id,
            qualificationProjectId: projectsToRemove.map(project => project.id)
        }
    });

    await QualificationProjectPartLinks.bulkCreate(projectIdsToAdd.map(projectId => ({
        qualificationUnitPartId: Number(req.params.id),
        qualificationProjectId: projectId
    })));

    await updatedPart.reload();

    res.json(updatedPart);
});

export const PartsRouter = router;
