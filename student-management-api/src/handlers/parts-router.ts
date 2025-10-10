import express from "express";
import { parseId } from "../utils/middleware";
import prisma from "../prisma-client";
import { RequestWithId } from "../types";
import { checkRequiredFields } from "../utils/checkRequiredFields";
import { HttpError } from "../classes/HttpError";

interface BasePartBody {
    name: string,
    description: string,
    materials: string,
    projectsInOrder: number[],
    parentQualificationUnit: number
}

const router = express();

router.get("/", async (req, res, next) => {
    // We don't need to use transactions in read-only operation
    const parts = await prisma.qualificationUnitPart.findMany()

    console.log(parts)
    res.json({
        status: 200,
        success: true,
        parts: parts
    });
});

router.get("/:id", parseId, async (req: RequestWithId, res, next) => {
    const part = await prisma.qualificationUnitPart.findUnique({ where: { id: req.id } })

    return res.json({
        status: 200,
        success: true,
        part: part
    });
});

router.get("/:id/projects", parseId, async (req: RequestWithId, res, next) => {
    const projects = await prisma.qualificationProject.findMany({
        where: {
            parts: {
                some: {
                    qualificationUnitPartId: req.id
                }
            }
        },
        include: {
            tags: true,
            parts: {
                where: {
                    qualificationUnitPartId: req.id
                },
                orderBy: { partOrderIndex: 'asc' },
                include: { qualificationUnitParts: true },
            }
        }
    })
    const mappedProjects = projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        materials: project.materials,
        duration: project.duration,
        isActive: project.isActive,
        parts: project.parts.map(part => part.qualificationUnitParts)
    }));

    res.json(mappedProjects)
});

router.get("/:id/parent_qualification_unit", parseId, async (req: RequestWithId, res, next) => {
    const qualificationUnit = await prisma.qualificationUnitPart.findUnique({
        where: {
            id: req.id
        },
        include: { qualificationUnits: true }
    })
    res.json(qualificationUnit.qualificationUnits)
});

router.post("/", async (req, res, next) => {
    try {
        const partFields: BasePartBody = req.body
        const requiredFields = [
            "name",
            "description",
            "materials",
            "projectsInOrder",
            "parentQualificationUnit"
        ]

        const missingFields = checkRequiredFields(partFields, requiredFields)
        if (missingFields.length) {
            throw new HttpError(400, `missing required fields: ${missingFields}`)
        }

        const part = await prisma.$transaction(async (transaction) => {
            const unitOrderIndex = await transaction.qualificationUnitPart.count({
                where: { qualificationUnitId: partFields.parentQualificationUnit }
            })

            const part = await transaction.qualificationUnitPart.create({
                data: {
                    name: partFields.name,
                    qualificationUnitId: Number(partFields.parentQualificationUnit),
                    description: partFields.description,
                    materials: partFields.materials,
                    unitOrderIndex: unitOrderIndex
                }
            })

            if (partFields.projectsInOrder && partFields.projectsInOrder.length > 0) {
                await transaction.qualificationProjectsPartsRelation.createMany({
                    data: partFields.projectsInOrder.reduce((acc, projectId, index) => [...acc, ({
                        qualificationProjectId: projectId,
                        qualificationUnitPartId: part.id,
                        partOrderIndex: index
                    })], [])
                })
            }
            return part
        })

        res.json({
            status: 200,
            success: true,
            part: part
        })
    } catch (error) {
        next(error)
    }
})

router.put("/:id", parseId, async (req: RequestWithId, res, next) => {
    try {
        const updatedPartFields: BasePartBody = req.body;

        const requiredFields = [
            "name",
            "description",
            "materials",
            "projectsInOrder",
            "parentQualificationUnit"
        ]

        const missingFields = checkRequiredFields(updatedPartFields, requiredFields)
        if (missingFields.length) {
            throw new HttpError(400, `missing required fields: ${missingFields}`)
        }

        const updatedPart = await prisma.$transaction(async (transaction) => {
            await transaction.qualificationUnitPart.update({
                where: { id: req.id },
                data: {
                    name: updatedPartFields.name,
                    qualificationUnitId: updatedPartFields.parentQualificationUnit,
                    description: updatedPartFields.description,
                    materials: updatedPartFields.materials,
                },
            })

            await transaction.qualificationProjectsPartsRelation.deleteMany({ where: { qualificationUnitPartId: req.id } })

            if (updatedPartFields.projectsInOrder) {
                await transaction.qualificationProjectsPartsRelation.createMany({
                    data: updatedPartFields.projectsInOrder.reduce((acc, projectId, index) => [...acc, ({
                        qualificationProjectId: projectId,
                        qualificationUnitPartId: req.id,
                        partOrderIndex: index
                    })], [])
                })
            }

            const updatedPart = await transaction.qualificationUnitPart.findUnique({
                where: { id: req.id }
            })

            return updatedPart
        })

        console.log('updatedPart:', updatedPart)

        res.json({
            status: 200,
            success: true,
            part: updatedPart
        })
    }
    catch (error) {
        if (error.code === 'P2025') {
            return next({ ...error, message: 'Part not found.' })
        }
        next(error)
    }
});

export const PartsRouter = router;
