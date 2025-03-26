import express from "express";
import { Sequelize } from "sequelize";
import { QualificationProject, QualificationProjectPartLinks, QualificationUnitPart } from "sequelize-models";

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
    const projectIdsInOrder = (await QualificationProjectPartLinks.findAll({
        where: { qualificationUnitPartId: req.params.id },
        order: [["partOrderIndex", "ASC"]]
    })).map(link => link.qualificationProjectId);

    const projects = await QualificationProject.findAll({
        include: [{
            association: QualificationProject.associations.parts,
            where: {
                id: req.params.id
            },
        }, {
            association: QualificationProject.associations.tags
        }],
    });

    res.json(projectIdsInOrder.map(projectId => projects.find(project => project.id == projectId)));
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
    const unitOrderIndex = await QualificationUnitPart.count({ where: { qualificationUnitId: partFields.parentQualificationUnit } });

    const part = await QualificationUnitPart.create({
        name: partFields.name,
        qualificationUnitId: partFields.parentQualificationUnit,
        description: partFields.description,
        materials: partFields.materials,
        unitOrderIndex: unitOrderIndex
    });
    
    if (partFields.projectsInOrder != undefined && partFields.projectsInOrder.length > 0) {
        await QualificationProjectPartLinks.bulkCreate(partFields.projectsInOrder.reduce((acc, projectId, index) => [...acc, ({
            qualificationProjectId: projectId,
            qualificationUnitPartId: part.id,
            partOrderIndex: index
        })], []));
    }

    res.json(part);
});

router.put("/:id", async (req, res) => {
    const updatedPartFields = req.body;

    const updatedPart = await QualificationUnitPart.findByPk(req.params.id);

    await updatedPart.update({
        name: updatedPartFields.name,
        qualificationUnitId: updatedPartFields.parentQualificationUnit,
        description: updatedPartFields.description,
        materials: updatedPartFields.materials,
    });

    await QualificationProjectPartLinks.destroy({ where: { qualificationUnitPartId: req.params.id } });

    await QualificationProjectPartLinks.bulkCreate(updatedPartFields.projectsInOrder.reduce((acc, projectId, index) => [...acc, ({
        qualificationProjectId: projectId,
        qualificationUnitPartId: req.params.id,
        partOrderIndex: index
    })], []));

    await updatedPart.reload();

    res.json(updatedPart);
});

export const PartsRouter = router;
