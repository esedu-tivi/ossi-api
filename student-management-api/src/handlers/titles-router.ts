import express from "express";
import { parseId } from "../utils/middleware.js";
import prisma from "../prisma-client";
import { RequestWithId } from "../types";

const router = express();

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
