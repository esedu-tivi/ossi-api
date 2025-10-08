import express, { Request } from "express";
//import { QualificationProject, QualificationProjectPartLinks, QualificationUnitPart, sequelize } from "sequelize-models";
import { beginTransaction, commitTransaction, parseId } from "../utils/middleware";
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
    // const parts = await QualificationUnitPart.findAll({
    //     transaction: res.locals._transaction
    // });

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
    // const part = await QualificationUnitPart.findOne({
    //     where: {
    //         id: req.params.id
    //     },
    //     transaction: res.locals._transaction
    // });
    const part = await prisma.qualificationUnitPart.findUnique({ where: { id: req.id } })

    return res.json({
        status: 200,
        success: true,
        part: part
    });
});

router.get("/:id/projects", parseId, async (req: RequestWithId, res, next) => {
    // const projects = await QualificationProject.findAll({
    //     include: [{
    //         association: QualificationProject.associations.parts,
    //         where: {
    //             id: req.params.id
    //         },
    //     }, {
    //         association: QualificationProject.associations.tags
    //     }],
    //     order: sequelize.literal("\"parts->qualification_projects_parts_relations\".\"part_order_index\" ASC"),
    //     transaction: res.locals._transaction
    // });
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

// router.get("/:id/parent_qualification_unit", beginTransaction, async (req, res, next) => {
//     try {
//         const qualificationUnit = await QualificationUnitPart.findByPk(req.params.id, {
//             include: [QualificationUnitPart.associations.unit],
//             transaction: res.locals._transaction
//         });

//         res.json(qualificationUnit.unit);

//         next();
//     } catch (e) {
//         next(e)
//     }
// }, commitTransaction);

router.get("/:id/parent_qualification_unit", parseId, async (req: RequestWithId, res, next) => {
    const qualificationUnit = await prisma.qualificationUnitPart.findUnique({
        where: {
            id: req.id
        },
        include: { qualificationUnits: true }
    })
    res.json(qualificationUnit.qualificationUnits)
});

// router.post("/", beginTransaction, async (req, res, next) => {
//     try {
//         const partFields = req.body;

//         // TODO should use transaction 
//         const unitOrderIndex = await QualificationUnitPart.count({
//             where: { qualificationUnitId: partFields.parentQualificationUnit },
//             transaction: res.locals._transaction
//         });

//         const part = await QualificationUnitPart.create({
//             name: partFields.name,
//             qualificationUnitId: partFields.parentQualificationUnit,
//             description: partFields.description,
//             materials: partFields.materials,
//             unitOrderIndex: unitOrderIndex
//         }, {
//             transaction: res.locals._transaction
//         });

//         if (partFields.projectsInOrder != undefined && partFields.projectsInOrder.length > 0) {
//             await QualificationProjectPartLinks.bulkCreate(partFields.projectsInOrder.reduce((acc, projectId, index) => [...acc, ({
//                 qualificationProjectId: projectId,
//                 qualificationUnitPartId: part.id,
//                 partOrderIndex: index
//             })], []), {
//                 transaction: res.locals._transaction
//             });
//         }

//         res.json({
//             status: 200,
//             success: true,
//             part: part
//         })

//         next();
//     } catch (e) {
//         next(e)
//     }
// }, commitTransaction);

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

// router.put("/:id", beginTransaction, async (req, res, next) => {
//     try {
//         const updatedPartFields = req.body;

//         const updatedPart = await QualificationUnitPart.findByPk(req.params.id, {
//             transaction: res.locals._transaction
//         });

//         if (updatedPart == null) {
//             res.json({
//                 status: 404,
//                 success: false,
//                 message: "Part not found."
//             });
//         }

//         await updatedPart.update({
//             name: updatedPartFields.name,
//             qualificationUnitId: updatedPartFields.parentQualificationUnit,
//             description: updatedPartFields.description,
//             materials: updatedPartFields.materials,
//         }, {
//             transaction: res.locals._transaction
//         });

//         await QualificationProjectPartLinks.destroy({
//             where: { qualificationUnitPartId: req.params.id },
//             transaction: res.locals._transaction
//         });

//         await QualificationProjectPartLinks.bulkCreate(updatedPartFields.projectsInOrder.reduce((acc, projectId, index) => [...acc, ({
//             qualificationProjectId: projectId,
//             qualificationUnitPartId: req.params.id,
//             partOrderIndex: index
//         })], []), {
//             transaction: res.locals._transaction
//         });

//         await updatedPart.reload({
//             transaction: res.locals._transaction
//         });

//         res.json({
//             status: 200,
//             success: true,
//             part: updatedPart
//         });

//         next();
//     } catch (e) {
//         next(e)
//     }
// }, commitTransaction);

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

// router.put("/:id", beginTransaction, async (req, res, next) => {
//     try {
//         const updatedPartFields = req.body;

//         const updatedPart = await QualificationUnitPart.findByPk(req.params.id, {
//             transaction: res.locals._transaction
//         });

//         if (updatedPart == null) {
//             res.json({
//                 status: 404,
//                 success: false,
//                 message: "Part not found."
//             });
//         }

//         await updatedPart.update({
//             name: updatedPartFields.name,
//             qualificationUnitId: updatedPartFields.parentQualificationUnit,
//             description: updatedPartFields.description,
//             materials: updatedPartFields.materials,
//         }, {
//             transaction: res.locals._transaction
//         });

//         await QualificationProjectPartLinks.destroy({
//             where: { qualificationUnitPartId: req.params.id },
//             transaction: res.locals._transaction
//         });

//         await QualificationProjectPartLinks.bulkCreate(updatedPartFields.projectsInOrder.reduce((acc, projectId, index) => [...acc, ({
//             qualificationProjectId: projectId,
//             qualificationUnitPartId: req.params.id,
//             partOrderIndex: index
//         })], []), {
//             transaction: res.locals._transaction
//         });

//         await updatedPart.reload({
//             transaction: res.locals._transaction
//         });

//         res.json({
//             status: 200,
//             success: true,
//             part: updatedPart
//         });

//         next();
//     } catch (e) {
//         next(e)
//     }
// }, commitTransaction);

export const PartsRouter = router;
