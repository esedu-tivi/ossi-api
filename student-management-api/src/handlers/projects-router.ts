import express, { Request } from "express";
import { Op, Sequelize } from "sequelize";
import { CompetenceRequirementsInProjects, QualificationCompetenceRequirement, QualificationCompetenceRequirements, QualificationProject, QualificationProjectPartLinks, QualificationProjectTag, QualificationProjectTagLinks, QualificationUnitPart, sequelize, Student } from "sequelize-models";
import { beginTransaction, commitTransaction, parseId } from "../utils/middleware";
import { redisPublisher } from "../redis";
import prisma from "../prisma-client";
import { checkRequiredFields } from "../utils/checkRequiredFields";

const router = express();

interface ProjectBody {
    name: string
    description: string,
    materials: string,
    duration: number,
    includedInParts: [number],
    competenceRequirements: [number],
    tags: [number],
    isActive: boolean
}


/*
router.get("/", async (req, res, next) => {
    try {
        const projects = await QualificationProject.findAll({
            include: [QualificationProject.associations.tags, QualificationProject.associations.competenceRequirements],
        });

        res.json({
            status: 200,
            success: true,
            projects: projects
        });

    } catch (e) {
        next(e);
    }
});
*/


router.get("/", async (req, res, next) => {
    try {
        const projects = await prisma.qualificationProject.findMany({
            orderBy: { id: 'desc' },
            include: {
                tags: {
                    include: {
                        qualificationProjectTags: true
                    }
                },
                competenceRequirements: {
                    select: {
                        id: true,
                        groupId: true,
                        description: true,
                    }
                }
            }
        })

        const parsedProjects = projects.map(project => ({
            ...project,
            tags: project.tags.map(tag => ({ ...tag.qualificationProjectTags })),
        }))

        res.json({
            status: 200,
            success: true,
            projects: parsedProjects
        });

    } catch (error) {
        next(error);
    }
});

// router.get("/:id", beginTransaction, async (req, res, next) => {
//     try {
//         const project = await QualificationProject.findOne({
//             where: {
//                 id: req.params.id
//             },
//             include: [QualificationProject.associations.parts, QualificationProject.associations.tags, QualificationProject.associations.competenceRequirements],
//             transaction: res.locals._transaction
//         });

//         res.json({
//             status: 200,
//             success: true,
//             project: project
//         });

//         next();
//     } catch (e) {
//         next(e);
//     }
// }, commitTransaction);

router.get("/:id", parseId, async (req: Request & { id: number }, res, next) => {
    try {
        const project = await prisma.qualificationProject.findFirst({
            where: {
                id: req.id
            },
            include: {
                parts: {
                    where: {
                        qualificationProjectId: req.id
                    },
                    include: { qualificationUnitParts: true }
                },
                tags: {
                    include: {
                        qualificationProjectTags: true
                    }
                },
                competenceRequirements: {
                    select: {
                        id: true,
                        groupId: true,
                        description: true,
                    }
                }
            }
        })

        const parsedProject = {
            ...project,
            parts: project.parts.map(part => ({ ...part.qualificationUnitParts })),
            tags: project.tags.map(tag => ({ ...tag.qualificationProjectTags })),
            competenceRequirements: project.competenceRequirements
        }

        res.json({
            status: 200,
            success: true,
            project: parsedProject
        });

    } catch (error) {
        next(error);
    }
});

// router.get("/:id/linked_qualification_unit_parts", beginTransaction, async (req, res, next) => {
//     try {
//         const unitParts = await QualificationUnitPart.findAll({
//             include: [{
//                 association: QualificationUnitPart.associations.projects,
//                 where: {
//                     id: req.params.id
//                 }
//             }],
//             transaction: res.locals._transaction
//         });

//         res.json(unitParts);

//         next();
//     } catch (e) {
//         next(e);
//     }
// }, commitTransaction);

router.get("/:id/linked_qualification_unit_parts", parseId, async (req: Request & { id: number }, res, next) => {
    try {
        const unitParts = await prisma.qualificationUnitPart.findMany({
            include: {
                projects: {
                    where: {
                        qualificationProjectId: req.id
                    },
                    include: {
                        qualificationProjects: true
                    }
                }
            }
        })

        const parsedUnitParts = unitParts.map(part => ({
            ...part,
            projects: part.projects.map(project => ({ ...project.qualificationProjects }))
        }))

        res.json(parsedUnitParts);

    } catch (error) {
        next(error);
    }
});

/*
router.post("/", beginTransaction, async (req, res, next) => {
    try {
        const project = req.body;

        const createdProject = await QualificationProject.create({
            name: project.name,
            description: project.description,
            materials: project.materials,
            duration: project.duration,
            isActive: project.isActive,
        }, {
            transaction: res.locals._transaction
        });

        for (const partId of project.includedInParts) {
            const part = await QualificationUnitPart.findByPk(partId, {
                include: [QualificationUnitPart.associations.unit],
                transaction: res.locals._transaction
            });

            if (part === null) {
                res.json({
                    status: 400,
                    success: false,
                    message: "Unknown part ID."
                });

                throw Error();
            }

            const lastPartOrderIndex = await QualificationProjectPartLinks.count({
                where: { qualificationUnitPartId: partId },
                transaction: res.locals._transaction
            });

            await QualificationProjectPartLinks.create({
                qualificationUnitPartId: partId,
                qualificationProjectId: createdProject.id,
                partOrderIndex: lastPartOrderIndex,
            }, {
                transaction: res.locals._transaction
            });
        }

        await Promise.all(project.tags.map(async tagId => {
            const tag = await QualificationProjectTag.findByPk(tagId, {
                transaction: res.locals._transaction
            });

            if (tag === null) {
                res.json({
                    status: 400,
                    success: false,
                    message: "Unknown tag ID."
                });

                throw Error();
            }

            await createdProject.addTag(tag, {
                transaction: res.locals._transaction
            });
        }));

        await Promise.all(project.competenceRequirements.map(async requirementId => {
            const requirement = await QualificationCompetenceRequirement.findByPk(requirementId, {
                transaction: res.locals._transaction
            });

            if (requirement === null) {
                res.json({
                    status: 400,
                    success: false,
                    message: "Unknown requirement ID."
                });

                throw Error();
            }

            await createdProject.addCompetenceRequirement(requirement, {
                transaction: res.locals._transaction
            });
        }));

        await createdProject.reload({
            include: [
                {
                    association: QualificationProject.associations.parts,
                    through: {
                        attributes: []
                    }
                },
                {
                    association: QualificationProject.associations.tags,
                    through: {
                        attributes: []
                    }
                },
                {
                    association: QualificationProject.associations.competenceRequirements,
                    through: {
                        attributes: []
                    }
                }
            ],
            transaction: res.locals._transaction
        });

        res.json({
            status: 200,
            success: true,
            project: createdProject
        });

        next();
    } catch (e) {
        next(e);
    }
}, commitTransaction);
 */

router.post("/", async (req, res, next) => {
    try {
        const createdProject = await prisma.$transaction(async (transaction) => {
            const project: ProjectBody = req.body

            const partsCount = await transaction.qualificationUnitPart.count({
                where: {
                    id: { in: project.includedInParts }
                }
            })

            const competenceRequirementsCount = await transaction.qualificationCompetenceRequirement.count({
                where: {
                    id: { in: project.competenceRequirements }
                }
            })

            const tagsCount = await transaction.qualificationProjectTag.count({
                where: {
                    id: { in: project.tags }
                }
            })

            if (partsCount !== project.includedInParts.length) {
                throw new Error("Unknown part ID.")
            }

            if (competenceRequirementsCount !== project.competenceRequirements.length) {
                throw new Error("Unknown requirement ID.")
            }

            if (tagsCount !== project.tags.length) {
                throw new Error("Unknown tag ID.")
            }

            const createdProject = await transaction.qualificationProject.create({
                data: {
                    name: project.name,
                    description: project.description,
                    materials: project.materials,
                    duration: project.duration,
                    isActive: project.isActive,
                    competenceRequirements: {
                        connect: project.competenceRequirements.map(id => ({ id }))
                    },
                    tags: {
                        create: project.tags.map(tagId => ({
                            qualificationProjectTags: { connect: { id: tagId } }
                        }))
                    }
                },
                select: {
                    id: true
                }
            })

            const partsRelations = project.includedInParts.map(async (id) => {
                const lastPartOrderIndex = await transaction.qualificationProjectsPartsRelation.count({ where: { qualificationUnitPartId: id } })
                return (
                    {
                        qualificationUnitPartId: id,
                        qualificationProjectId: createdProject.id,
                        partOrderIndex: lastPartOrderIndex
                    })
            })

            await transaction.qualificationProjectsPartsRelation.createMany({
                data: await Promise.all(partsRelations)
            })

            const returnedProject = await transaction.qualificationProject.findUnique({
                where: { id: createdProject.id },
                include: {
                    parts: {
                        include: {
                            qualificationUnitParts: true
                        }
                    },
                    tags: {
                        include: {
                            qualificationProjectTags: true
                        }
                    },
                    competenceRequirements: {
                        select: {
                            id: true,
                            groupId: true,
                            description: true,
                        }
                    }
                }
            })
            return returnedProject
        })

        const parsedProject = {
            ...createdProject,
            parts: createdProject.parts.map(part => ({ ...part.qualificationUnitParts })),
            tags: createdProject.tags.map(tag => ({ ...tag.qualificationProjectTags })),
            competenceRequirements: createdProject.competenceRequirements.map(requirement => ({ ...requirement }))
        }

        res.json({
            status: 200,
            success: true,
            project: parsedProject
        });

    } catch (error) {
        next(error);
    }
});

/*
router.put("/:id", beginTransaction, async (req, res, next) => {
    try {
        const updatedProjectFields = req.body;

        const updatedProject = await QualificationProject.findByPk(req.params.id, {
            include: [QualificationProject.associations.parts, QualificationProject.associations.tags, QualificationProject.associations.competenceRequirements],
            transaction: res.locals._transaction
        });

        if (updatedProject == null) {
            res.json({
                status: 404,
                success: false,
                message: "Project not found."
            })

            throw Error();
        }

        await updatedProject.update({
            name: updatedProjectFields.name,
            description: updatedProjectFields.description,
            materials: updatedProjectFields.materials,
            duration: updatedProjectFields.duration,
            isActive: updatedProjectFields.isActive,
        }, {
            transaction: res.locals._transaction
        });


        const projectRemovedFromParts = updatedProject.parts.filter(part => !updatedProjectFields.includedInParts.includes(part.id)).map(part => part.id);
        const projectAddedToParts = updatedProjectFields.includedInParts.filter(id => !updatedProject.parts.map(part => part.id).includes(id));

        const projectPartLinks = await QualificationProjectPartLinks.findAll({
            where: { qualificationProjectId: req.params.id },
            transaction: res.locals._transaction
        });

        await QualificationProjectPartLinks.destroy({
            where: { qualificationUnitPartId: projectRemovedFromParts, qualificationProjectId: req.params.id },
            transaction: res.locals._transaction
        });

        await Promise.all(projectRemovedFromParts.map(async partId => {
            await QualificationProjectPartLinks.update(
                { partOrderIndex: sequelize.literal("part_order_index - 1") },
                {
                    where: {
                        qualificationUnitPartId: partId,
                        partOrderIndex: { [Op.gt]: projectPartLinks.find(link => link.qualificationUnitPartId == partId).partOrderIndex }
                    },
                    transaction: res.locals._transaction
                }
            );
        }));

        await Promise.all(projectAddedToParts.map(async partId => {
            const lastPartOrderIndex = await QualificationProjectPartLinks.count({
                where: { qualificationUnitPartId: partId },
                transaction: res.locals._transaction
            });

            await QualificationProjectPartLinks.create({
                qualificationUnitPartId: partId,
                qualificationProjectId: updatedProject.id,
                partOrderIndex: lastPartOrderIndex,
            }, {
                transaction: res.locals._transaction
            });
        }));

        await QualificationProjectTagLinks.destroy({
            where: { qualificationProjectId: req.params.id },
            transaction: res.locals._transaction
        });

        await updatedProject.addTags(updatedProjectFields.tags, {
            transaction: res.locals._transaction
        });

        await CompetenceRequirementsInProjects.destroy({
            where: { projectId: req.params.id },
            transaction: res.locals._transaction
        });

        await updatedProject.addCompetenceRequirements(updatedProjectFields.competenceRequirements, {
            transaction: res.locals._transaction
        });

        await updatedProject.reload({
            include: [
                {
                    association: QualificationProject.associations.parts,
                    through: {
                        attributes: []
                    }
                },
                {
                    association: QualificationProject.associations.tags,
                    through: {
                        attributes: []
                    }
                },
                {
                    association: QualificationProject.associations.competenceRequirements,
                    through: {
                        attributes: []
                    }
                }
            ],
            transaction: res.locals._transaction
        });

        res.json({
            status: 200,
            success: true,
            project: updatedProject
        });

        // TODO: implement to only notify students that are doing the project
        if (updatedProjectFields.notifyStudents) {
            const students = await Student.findAll();

            const notificationPayload = {
                recipients: students.map(student => student.id),
                notification: {
                    type: "ProjectUpdate",
                    projectId: updatedProject.id,
                    updateMessage: "Projektia päivitetty"
                }
            };

            redisPublisher.publish('notification', JSON.stringify(notificationPayload));
        }

        next();
    } catch (e) {
        next(e);
    }
}, commitTransaction);
*/

router.put("/:id", parseId, async (req: Request & { id: number }, res, next) => {
    try {
        const updatedProjectFields: ProjectBody & { notifyStudents: boolean } = req.body;
        const requiredFields = [
            "name",
            "description",
            "materials",
            "duration",
            "includedInParts",
            "competenceRequirements",
            "tags",
            "isActive",
            "notifyStudents"
        ]

        const missingFields = checkRequiredFields(updatedProjectFields, requiredFields)
        if (missingFields.length) {
            return res.json({
                status: 400,
                success: false,
                message: `Missing fields: ${missingFields}`
            })
        }

        const updatedProject = await prisma.$transaction(async (transaction) => {
            const projectToUpdate = await transaction.qualificationProject.findFirst({
                where: { id: req.id },
                include: {
                    parts: {
                        include: {
                            qualificationUnitParts: true
                        }
                    }
                }
            })

            if (!projectToUpdate) {
                throw new Error("Project not found.")
            }

            const projectRemovedFromParts = projectToUpdate.parts.filter(part => !updatedProjectFields.includedInParts.includes(part.qualificationUnitParts.id)).map(part => part.qualificationUnitParts.id)
            const projectAddedToParts = updatedProjectFields.includedInParts
                .filter(id => !projectToUpdate.parts
                    .map(part => part.qualificationUnitParts.id)
                    .includes(id)
                )

            await transaction.qualificationProject.update({
                where: { id: req.id },
                data: {
                    name: updatedProjectFields.name,
                    description: updatedProjectFields.description,
                    materials: updatedProjectFields.materials,
                    duration: updatedProjectFields.duration,
                    isActive: updatedProjectFields.isActive,
                    parts: {
                        create: projectAddedToParts.map((id, index) => ({
                            qualificationUnitPartId: id,
                            qualificationProjectId: req.id,
                            partOrderIndex: index + 1
                        })),
                        deleteMany: {
                            qualificationUnitPartId: {
                                in: projectRemovedFromParts
                            }
                        }
                    },
                    tags: {
                        deleteMany: {},
                        create: updatedProjectFields.tags.map(tagId => ({
                            qualificationProjectTags: { connect: { id: tagId } }
                        }))
                    },
                    competenceRequirements: {
                        set: updatedProjectFields.competenceRequirements.map(id => ({ id }))
                    }
                }
            })

            // TODO: implement to only notify students that are doing the project
            if (updatedProjectFields.notifyStudents) {
                const students = await transaction.student.findMany();

                const notificationPayload = {
                    recipients: students.map(student => student.userId),
                    notification: {
                        type: "ProjectUpdate",
                        projectId: projectToUpdate.id,
                        updateMessage: "Projektia päivitetty"
                    }
                };

                redisPublisher.publish('notification', JSON.stringify(notificationPayload));
            }

            const updatedProject = await transaction.qualificationProject.findFirst({
                where: {
                    id: projectToUpdate.id
                },
                include: {
                    parts: {
                        include: {
                            qualificationUnitParts: true
                        }
                    },
                    tags: {
                        include: {
                            qualificationProjectTags: true
                        }
                    },
                    competenceRequirements: true
                }
            })

            return {
                ...updatedProject,
                parts: updatedProject.parts.map(part => ({ ...part.qualificationUnitParts })),
                tags: updatedProject.tags.map(tag => ({ ...tag.qualificationProjectTags })),
                competenceRequirements: updatedProject.competenceRequirements.map(requirement => ({
                    id: requirement.id,
                    description: requirement.description,
                    groupId: requirement.groupId
                }))
            }
        })

        res.json({
            status: 200,
            success: true,
            project: updatedProject
        })

    } catch (error) {
        next(error)
    }
})

export const ProjectsRouter = router;
