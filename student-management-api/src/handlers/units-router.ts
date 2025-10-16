import express from "express";
import { parseId } from "../utils/middleware.js";
import prisma from "../prisma-client.js";
import { type RequestWithId } from "../types.js";
import { HttpError } from "../classes/HttpError.js";

const router = express();

interface RequestWithPartOrder extends RequestWithId {
    body: {
        partOrder: string[]
    }
}

router.get("/", async (req, res, next) => {
    try {
        const units = await prisma.qualificationUnit.findMany()

        res.json({
            status: 200,
            success: true,
            units: units
        })

    } catch (error) {
        next(error)
    }
})

router.get("/:id/competence_requirements", parseId, async (req: RequestWithId, res, next) => {
    try {
        const qualificationCompetenceRequirements = await prisma.qualificationCompetenceRequirements.findMany({
            where: {
                qualificationUnitId: req.id
            },
            include: {
                requirements: {
                    select: {
                        id: true,
                        groupId: true,
                        description: true
                    }
                }
            },
        })

        res.json(qualificationCompetenceRequirements)

    } catch (error) {
        next(error)
    }
})

router.get("/:id/parts", parseId, async (req: RequestWithId, res, next) => {
    try {
        const parts = await prisma.qualificationUnitPart.findMany({
            where: {
                qualificationUnitId: req.id
            },
            orderBy: {
                unitOrderIndex: "asc"
            }
        })

        res.json(parts)

    } catch (error) {
        next(error)
    }
})

router.post("/:id/part_order", parseId, async (req: RequestWithPartOrder, res, next) => {
    try {
        const { partOrder } = req.body;

        if (!partOrder) {
            throw new HttpError(400, "partOrder missing from body")
        }

        const partIds = partOrder.map(Number)

        // Validate that all elements in partOrder are numbers
        if (partIds.includes(NaN) || partOrder.includes("")) {
            throw new HttpError(400, "partOrder contains non-numeric values")
        }

        await prisma.$transaction(async (transaction) => {
            const parts = await transaction.qualificationUnitPart.findMany({
                where: {
                    id: { in: partIds },
                    qualificationUnitId: req.id,
                },
            });

            if (parts.length !== partIds.length) {
                throw new HttpError(400, "Updating a part order that doesn't belong to the specified unit or part not found.")
            }

            const updates = partIds.map((partId, index) =>
                transaction.qualificationUnitPart.update({
                    where: { id: partId },
                    data: { unitOrderIndex: index },
                })
            )

            await Promise.all(updates);

            res.json({
                status: 200,
                success: true,
            })
        })
    } catch (error) {
        next(error)
    }
})

export const UnitsRouter = router
