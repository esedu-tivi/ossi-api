import axios from "axios";
import express from "express";
import { QualificationCompetenceRequirement, QualificationCompetenceRequirements, QualificationUnitPart } from "sequelize-models";
import { QualificationUnit } from "sequelize-models/dist/qualification-unit";

const router = express();

router.get("/", async (req, res) => {
    const units = await QualificationUnit.findAll();

    return res.json(units);
});

router.get("/:id/competence_requirements", async (req, res) => {
    const qualificationCompetenceRequirements = await QualificationCompetenceRequirements.findAll({
        where: {
            qualificationUnitId: req.params.id
        },
        include: [QualificationCompetenceRequirements.associations.requirements]
    });
        
    res.json(qualificationCompetenceRequirements);
});

router.get("/:id/parts", async (req, res) => {
    const parts = await QualificationUnitPart.findAll({
        where: {
            qualificationUnitId: req.params.id
        },
        order: [["unit_order_index", "ASC"]]
    });

    res.json(parts);
});

router.post("/:id/part_order", async (req, res) => {
    const partOrder = req.body.partOrder;

    await Promise.all(partOrder.reduce(async (_, partId, index) => {
        await QualificationUnitPart.update(
            { unitOrderIndex: index },
            {
                where: {
                    id: partId
                }
            }
        );
    }));

    res.json({ status: "ok" })
})

export const UnitsRouter = router;
