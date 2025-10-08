import express from "express";
import { beginTransaction, commitTransaction, parseId } from "../utils/middleware";
//import { MandatoryQualificationUnitsForTitle, QualificationTitle, QualificationUnit } from "sequelize-models";
import prisma from "../prisma-client";
import { RequestWithId } from "../types";

const router = express();

/*
router.get("/", beginTransaction, async (req, res, next) => {
    try {
        const titles = await QualificationTitle.findAll({
            transaction: res.locals._transaction
        });

        res.json({
            status: 200,
            success: true,
            titles: titles
        });

        next();
    } catch (e) {
        next(e);
    }
}, commitTransaction);
*/

router.get("/", async (_req, res, next) => {
    try {
        const titles = await prisma.qualificationTitle.findMany()

        res.json({
            status: 200,
            success: true,
            titles: titles
        });

    } catch (error) {
        next(error)
    }
})

/*
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
*/

router.get("/:id/mandatory_units", parseId, async (req: RequestWithId, res, next) => {
    try {
        const unitIds = (await prisma.mandatoryQualificationUnitsForTitle.findMany({
            where: {
                titleId: req.id
            },
            select: { unitId: true }
        })).map(mandatoryTitleUnits => mandatoryTitleUnits.unitId)

        const units = await prisma.qualificationUnit.findMany({
            where: {
                id: { in: unitIds }
            }
        })

        res.json(units)

    } catch (error) {
        next(error)
    }
})

export const TitlesRouter = router;
