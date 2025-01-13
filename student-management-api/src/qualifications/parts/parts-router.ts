import express from "express";
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
    // TODO

    res.status(400);
});

router.post("/", async (req, res) => {
    const partFields = req.body;

    // TODO should use transaction
    const part = await QualificationUnitPart.create({
        name: partFields.name,
        qualificationUnitId: partFields.parentQualificationUnit
    });
    
    if (partFields.projects != undefined && partFields.projects.length > 0) {
        await QualificationProjectPartLinks.bulkCreate(partFields.projects.map(projectId => ({
            qualificationProjectId: projectId,
            qualificationUnitPartId: part.id
        })));
    }

    res.json(part);
});

router.put("/", async (req, res) => {

});

export const PartsRouter = router;
