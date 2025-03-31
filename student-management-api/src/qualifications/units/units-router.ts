import axios from "axios";
import express from "express";
import { QualificationCompetenceRequirement, QualificationCompetenceRequirements, QualificationUnitPart, QualificationUnit } from "sequelize-models";

const router = express();

router.get("/", async (req, res, next) => {
    try {
        const units = await QualificationUnit.findAll({
            transaction: res.locals._transaction
        });

        res.json(units);
        
        next();
    } catch (e) {
        next(e)
    }
});

router.get("/:id/competence_requirements", async (req, res, next) => {
    try {
        const qualificationCompetenceRequirements = await QualificationCompetenceRequirements.findAll({
            where: {
                qualificationUnitId: req.params.id
            },
            include: [QualificationCompetenceRequirements.associations.requirements],
            transaction: res.locals._transaction
        });
            
        res.json(qualificationCompetenceRequirements);
        
        next();
    } catch (e) {
        next(e)
    }
});

router.get("/:id/parts", async (req, res, next) => {
    try {
        const parts = await QualificationUnitPart.findAll({
            where: {
                qualificationUnitId: req.params.id
            },
            order: [["unit_order_index", "ASC"]],
            transaction: res.locals._transaction
        });

        res.json(parts);
        
        next();
    } catch (e) {
        next(e)
    }
});

router.post("/:id/part_order", async (req, res, next) => {
    try {
        const unitId = Number(req.params.id);
        const partOrder = req.body.partOrder;
        
        for (let index = 0; index < partOrder.length; index++) {
            const part = await QualificationUnitPart.findByPk(partOrder[index], {
                transaction: res.locals._transaction
            });

            if (part.qualificationUnitId != unitId) {
                throw Error("updating a part order that doesn't belong to the specified unit")
            }

            await part.update({ unitOrderIndex: index }, { 
                transaction: res.locals._transaction
            });
        }

        res.json({ status: "ok" })
        
        next();
    } catch (e) {
        next(e)
    }
})

export const UnitsRouter = router;
