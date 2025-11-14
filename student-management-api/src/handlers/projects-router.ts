import express from "express";
import { parseId } from "../utils/middleware.js";
import { redisPublisher } from "../redis.js";
import prisma, { enumAssignedProjectsForStudentsProjectStatus } from "prisma-orm";
import { checkRequiredFields } from "../utils/checkRequiredFields.js";
import { type RequestWithId } from "../types.js";
import { HttpError } from "../classes/HttpError.js";
import { checkIds } from "../utils/checkIds.js";

const router = express();

interface ProjectBody {
    name: string
    description: string,
    materials: string,
    duration: string,
    includedInParts: [string],
    competenceRequirements: [string],
    tags: [string],
    isActive: boolean
}

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
        })

    } catch (error) {
        next(error)
    }
});

router.get("/:id", parseId, async (req: RequestWithId, res, next) => {
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
                competenceRequirements: true
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
        })

    } catch (error) {
        next(error)
    }
})

router.get("/:id/linked_qualification_unit_parts", parseId, async (req: RequestWithId, res, next) => {
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

router.post("/", async (req, res, next) => {
    try {
        const createdProject = await prisma.$transaction(async (transaction) => {
            const project: ProjectBody = req.body

            const partsCount = await transaction.qualificationUnitPart.count({
                where: {
                    id: { in: project.includedInParts.map(id => Number(id)) }
                }
            })

            const competenceRequirementsCount = await transaction.qualificationCompetenceRequirement.count({
                where: {
                    id: { in: project.competenceRequirements.map(id => Number(id)) }
                }
            })

            const tagsCount = await transaction.qualificationProjectTag.count({
                where: {
                    id: { in: project.tags.map(id => Number(id)) }
                }
            })

            if (partsCount !== project.includedInParts.length) {
                throw new HttpError(400, "Unknown part ID.")
            }

            if (competenceRequirementsCount !== project.competenceRequirements.length) {
                throw new HttpError(400, "Unknown requirement ID.")
            }

            if (tagsCount !== project.tags.length) {
                throw new HttpError(400, "Unknown tag ID.")
            }

            const createdProject = await transaction.qualificationProject.create({
                data: {
                    name: project.name,
                    description: project.description,
                    materials: project.materials,
                    duration: Number(project.duration),
                    isActive: project.isActive,
                    competenceRequirements: {
                        connect: project.competenceRequirements.map(id => ({ id: Number(id) }))
                    },
                    tags: {
                        create: project.tags.map(tagId => ({
                            qualificationProjectTags: { connect: { id: Number(tagId) } }
                        }))
                    }
                },
                select: {
                    id: true
                }
            })

            const partsRelations = project.includedInParts.map(async (id) => {
                const lastPartOrderIndex = await transaction.qualificationProjectsPartsRelation.count({ where: { qualificationUnitPartId: Number(id) } })
                return (
                    {
                        qualificationUnitPartId: Number(id),
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
                    competenceRequirements: true
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


        console.log('parsedProject in api', parsedProject)

        res.json({
            status: 200,
            success: true,
            project: parsedProject
        });

    } catch (error) {
        next(error);
    }
});

router.put("/:id", parseId, async (req: RequestWithId, res, next) => {
    try {
        const updatedProjectFields: ProjectBody & { notifyStudents?: boolean } = req.body;
        const requiredFields = [
            "name",
            "description",
            "materials",
            "duration",
            "includedInParts",
            "competenceRequirements",
            "tags",
            "isActive"
        ]

        const missingFields = checkRequiredFields(updatedProjectFields, requiredFields)
        if (missingFields.length) {
            throw new HttpError(400, `Missing fields: ${missingFields}`)
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
                throw new HttpError(404, "Project not found.")
            }

            const projectRemovedFromParts = projectToUpdate.parts
                .filter(part => !updatedProjectFields.includedInParts
                    .map(Number).includes(Number(part.qualificationUnitParts.id)))
                .map(part => part.qualificationUnitParts.id)

            const projectAddedToParts = updatedProjectFields.includedInParts
                .filter(id => !projectToUpdate.parts
                    .map(part => part.qualificationUnitParts.id)
                    .includes(Number(id))
                )

            await transaction.qualificationProject.update({
                where: { id: req.id },
                data: {
                    name: updatedProjectFields.name,
                    description: updatedProjectFields.description,
                    materials: updatedProjectFields.materials,
                    duration: Number(updatedProjectFields.duration),
                    isActive: updatedProjectFields.isActive,
                    parts: {
                        create: projectAddedToParts.map((id, index) => ({
                            qualificationUnitPartId: Number(id),
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
                            qualificationProjectTags: { connect: { id: Number(tagId) } }
                        }))
                    },
                    competenceRequirements: {
                        set: updatedProjectFields.competenceRequirements.map(id => ({ id: Number(id) }))
                    }
                }
            })

            if (updatedProjectFields.notifyStudents) {
                const students = await transaction.student.findMany({
                    where: {
                        assignedProjectsForStudent: {
                            some: {
                                projectId: projectToUpdate.id
                            }
                        }
                    }
                });

                console.log('students to notify:', students)

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
                competenceRequirements: updatedProject.competenceRequirements
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

router.patch("/:id/change_status", parseId, async (req: RequestWithId, res, next) => {
    try {
        console.log('req.body', req.body)
        const { status, studentId, teacherComment }: { status: enumAssignedProjectsForStudentsProjectStatus, studentId: string, teacherComment: string | null } = req.body

        checkIds({ studentId })

        if (status === 'ACCEPTED' || status === 'REJECTED') {
            const project = await prisma.assignedProjectsForStudent.update({
                where: {
                    studentId_projectId: {
                        studentId: Number(studentId),
                        projectId: req.id
                    }
                },
                data: {
                    projectStatus: status,
                    teacherComment
                }
            })

            const notificationPayload = {
                recipients: [studentId],
                notification: {
                    type: "ProjectStatusChange",
                    projectId: project.projectId,
                    status: project.projectStatus,
                    message: `Projektin palautus on ${status === 'ACCEPTED' ? 'hyväksytty' : 'hylätty'}`,
                    teacherComment: project.teacherComment
                }
            };

            redisPublisher.publish('notification', JSON.stringify(notificationPayload));

            return res.json({
                status: 200,
                success: true,
                message: `Status changed to '${project.projectStatus}' ${project.teacherComment ? `with ${project.teacherComment} comment` : ''}`
            })
        }
        else {
            return res.json({
                status: 400,
                success: false,
                message: 'status should only be accepted or rejected'
            })
        }

    }
    catch (error) {
        next(error)
    }
})

export const ProjectsRouter = router;
