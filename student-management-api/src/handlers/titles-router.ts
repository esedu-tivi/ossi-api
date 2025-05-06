import express from "express";
import { beginTransaction, commitTransaction } from "../utils/middleware";
import { MandatoryQualificationUnitsForTitle, QualificationTitle, QualificationUnit } from "sequelize-models";

const router = express();

router.get("/", beginTransaction, async (req, res, next) => {
    try {
        const titles = await QualificationTitle.findAll({
            transaction: res.locals._transaction
        });

        res.json(titles);
        
        next();
    } catch (e) {
        next(e);
    }
}, commitTransaction);

router.get("/:id/mandatory_units", beginTransaction, async (req, res, next) => {
    try {
        const unitIds = (await MandatoryQualificationUnitsForTitle.findAll({
            where: {
                titleId: req.params.id
            },
            transaction: res.locals._transaction
        })).map(mandatoryTitleUnits => mandatoryTitleUnits.unitId);
        
        const units = await QualificationUnit.findAll({
            where: {
                id: unitIds
            },
            transaction: res.locals._transaction
        });
        
        res.json(units);

        next();
    } catch (e) {
        next(e);
    }
}, commitTransaction);

export const TitlesRouter = router;
