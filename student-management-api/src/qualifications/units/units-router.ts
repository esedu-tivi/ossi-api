import axios from "axios";
import express from "express";
import { QualificationCompetenceRequirement, QualificationCompetenceRequirements, QualificationUnitPart, QualificationUnit } from "sequelize-models";

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
    const unitId = req.body.id;
    const partOrder = req.body.partOrder;
    
    for (let index = 0; index < partOrder.length; index++) {
        const part = await QualificationUnitPart.findByPk();

        if (part.qualificationUnitId != unitId) {
            throw Error("updating a part order that doesn't belong to the specified unit")
        }

        await part.update(
            { unitOrderIndex: index },
        )
    }

    res.json({ status: "ok" })
})

export const UnitsRouter = router;
