import express, { type NextFunction, type Response } from "express";
import { parseId } from "../utils/middleware.js";
import prisma from "prisma-orm";
import { type RequestWithId } from "../types.js";
import { checkIds, NeededType } from "../utils/checkIds.js";
const router = express.Router();

interface RequestWithIdAndProjectId extends RequestWithId {
    body: {
        projectId: string
    }
}

router.get("/:id/", parseId, async (req: RequestWithId, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.id } })
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.id } });

    res.json({
        status: 200,
        success: true,
        teacher: { ...user, ...teacher }
    });
});

router.get("/:id/assignedTeachingProjects", parseId, async (req: RequestWithId, res, next) => {
    try {
        const projects = await prisma.teacher.findFirst({
            where: { userId: req.id },
            select: {
                teachingQualificationProject: {
                    include: {
                        parts: {
                            include: {
                                qualificationUnitParts: true
                            }
                        },
                        competenceRequirements: true,
                        tags: {
                            include: {
                                qualificationProjectTags: true
                            }
                        }
                    }
                }
            }
        })

        const parsedProjects = projects.teachingQualificationProject.map(project => ({
            ...project,
            parts: project.parts.map(part => ({ ...part.qualificationUnitParts })),
            tags: project.tags.map(tag => ({ ...tag.qualificationProjectTags })),
            competenceRequirements: project.competenceRequirements
        }))

        res.json({
            status: 200,
            success: true,
            assignedProjects: parsedProjects
        })
    }
    catch (error) {
        next(error)
    }
})

router.post("/:id/assignTeachingProject", parseId, async (req: RequestWithIdAndProjectId, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.body

        checkIds({ projectId }, NeededType.NUMBER)

        await prisma.teacher.update({
            where: { userId: req.id },
            data: {
                teachingQualificationProject: {
                    connect: { id: Number(projectId) }
                }
            }
        })

        res.json({
            status: 201,
            success: true,
            message: "Successfully assigned project"
        })

    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.delete("/:id/unassignTeachingProject", parseId, async (req: RequestWithIdAndProjectId, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.body

        checkIds({ projectId }, NeededType.NUMBER)

        await prisma.teacher.update({
            where: { userId: req.id },
            data: {
                teachingQualificationProject: {
                    disconnect: { id: Number(projectId) }
                }
            }
        })

        res.json({
            status: 204,
            success: true,
            message: "Successfully unassigned project"
        })

    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.patch("/:id/updateTeachingProjectAssigns", parseId, async (req: Omit<RequestWithId, 'body'> & { body: { assignProjectIds: string[], unassignProjectIds: string[] } }, res: Response, next: NextFunction) => {
    try {
        const { assignProjectIds, unassignProjectIds } = req.body

        checkIds(assignProjectIds, NeededType.NUMBER)
        checkIds(unassignProjectIds, NeededType.NUMBER)

        await prisma.teacher.update({
            where: { userId: req.id },
            data: {
                teachingQualificationProject: {
                    connect: assignProjectIds.map((projectId: string) => ({ id: Number(projectId) })),
                    disconnect: unassignProjectIds.map((projectId: string) => ({ id: Number(projectId) }))
                }
            }
        })

        res.json({
            status: 204,
            success: true,
            message: "Successfully assigned and/or unassigned project(s)"
        })

    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.get("/:id/assignedStudentGroups", parseId, async (req: RequestWithId, res, next) => {
    try {
        const assignedStudentGroups = await prisma.teacher.findFirst({
            where: { userId: req.id },
            select: {
                studentGroups: {
                    select: {
                        id: true,
                        groupName: true
                    }
                }
            }
        })

        const parsedStudentGroups = assignedStudentGroups.studentGroups.map(group => ({
            id: group.id,
            groupId: group.groupName
        }))

        res.json({
            status: 200,
            success: true,
            studentGroups: parsedStudentGroups
        })
    }
    catch (error) {
        next(error)
    }
})

router.post("/:id/assignStudentGroups", parseId, async (req: Omit<RequestWithId, 'body'> & { body: { groupIds: string[] } }, res: Response, next: NextFunction) => {
    try {
        const { groupIds } = req.body
        checkIds(groupIds, NeededType.STRING)

        await prisma.teacher.update({
            where: { userId: req.id },
            data: {
                studentGroups: {
                    connect: groupIds.map((groupId: string) => ({ groupName: groupId }))
                }
            }
        })

        res.json({
            status: 201,
            success: true,
            message: "Successfully assigned studentGroup"
        })

    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.delete("/:id/unassignStudentGroups", parseId, async (req: Omit<RequestWithId, 'body'> & { body: { groupIds: string[] } }, res: Response, next: NextFunction) => {
    try {
        const { groupIds } = req.body
        checkIds(groupIds, NeededType.STRING)

        await prisma.teacher.update({
            where: { userId: req.id },
            data: {
                studentGroups: {
                    disconnect: groupIds.map((groupId: string) => ({ groupName: groupId }))
                }
            }
        })

        res.json({
            status: 204,
            success: true,
            message: "Successfully unassigned studentGroup(s)"
        })

    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.patch("/:id/updateStudentGroupAssigns", parseId, async (req: Omit<RequestWithId, 'body'> & { body: { assignGroupIds: string[], unassignGroupIds: string[] } }, res: Response, next: NextFunction) => {
    try {
        const { assignGroupIds, unassignGroupIds } = req.body
        checkIds(assignGroupIds, NeededType.STRING)
        checkIds(unassignGroupIds, NeededType.STRING)

        await prisma.teacher.update({
            where: { userId: req.id },
            data: {
                studentGroups: {
                    connect: assignGroupIds.map((groupId: string) => ({ groupName: groupId })),
                    disconnect: unassignGroupIds.map((groupId: string) => ({ groupName: groupId }))
                }
            }
        })

        res.json({
            status: 204,
            success: true,
            message: "Successfully assigned and unassigned studentGroup(s)"
        })

    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.get("/:id/assignedTags", parseId, async (req: RequestWithId, res, next) => {
    try {
        const assignedTags = await prisma.teacher.findFirst({
            where: { userId: req.id },
            select: {
                projectTagFilter: true
            }
        })

        res.json({
            status: 200,
            success: true,
            tags: assignedTags.projectTagFilter
        })
    }
    catch (error) {
        next(error)
    }
})

router.post("/:id/assignTags", parseId, async (req: Omit<RequestWithId, 'body'> & { body: { tagIds: string[] } }, res: Response, next: NextFunction) => {
    try {
        const { tagIds } = req.body
        checkIds(tagIds, NeededType.NUMBER)

        await prisma.teacher.update({
            where: { userId: req.id },
            data: {
                projectTagFilter: {
                    connect: tagIds.map((tagId: string) => ({ id: Number(tagId) }))
                }
            }
        })

        res.json({
            status: 201,
            success: true,
            message: "Successfully assigned projectTagFilter(s)"
        })

    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.delete("/:id/unassignTags", parseId, async (req: Omit<RequestWithId, 'body'> & { body: { tagIds: string[] } }, res: Response, next: NextFunction) => {
    try {
        const { tagIds } = req.body
        checkIds(tagIds, NeededType.NUMBER)

        await prisma.teacher.update({
            where: { userId: req.id },
            data: {
                projectTagFilter: {
                    disconnect: tagIds.map((tagId: string) => ({ id: Number(tagId) }))
                }
            }
        })

        res.json({
            status: 204,
            success: true,
            message: "Successfully unassigned projectTagFilter(s)"
        })

    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.patch("/:id/updateTagAssigns", parseId, async (req: Omit<RequestWithId, 'body'> & { body: { assignedTagIds: string[], unassignedTagIds: string[] } }, res: Response, next: NextFunction) => {
    try {
        const { assignedTagIds, unassignedTagIds } = req.body
        checkIds(assignedTagIds, NeededType.NUMBER)
        checkIds(unassignedTagIds, NeededType.NUMBER)

        await prisma.teacher.update({
            where: { userId: req.id },
            data: {
                projectTagFilter: {
                    connect: assignedTagIds.map((tagId: string) => ({ id: Number(tagId) })),
                    disconnect: unassignedTagIds.map((tagId: string) => ({ id: Number(tagId) }))
                }
            }
        })

        res.json({
            status: 204,
            success: true,
            message: "Successfully assigned and unassigned projectTagFilter(s)"
        })

    }
    catch (error) {
        next(error)
    }
})

router.get("/:id/teachingQualificationUnits", parseId, async (req: RequestWithId, res, next) => {
    try {
        const foundTeachingQualificationUnits = await prisma.teacher.findFirst({
            where: {
                userId: req.id
            },
            select: {
                teachingQualificationUnit: true
            }
        })

        res.json({
            status: 200,
            success: true,
            qualificationUnits: foundTeachingQualificationUnits.teachingQualificationUnit
        })
    }
    catch (error) {
        next(error)
    }
})

router.patch("/:id/updateTeachingQualificationUnits", parseId, async (req: Omit<RequestWithId, 'body'> & { body: { assignQualificationUnitIds: string[], unassignQualificationUnitIds: string[] } }, res: Response, next: NextFunction) => {
    try {
        const { assignQualificationUnitIds, unassignQualificationUnitIds } = req.body
        checkIds(assignQualificationUnitIds, NeededType.NUMBER)
        checkIds(unassignQualificationUnitIds, NeededType.NUMBER)

        await prisma.teacher.update({
            where: { userId: req.id },
            data: {
                teachingQualificationUnit: {
                    connect: assignQualificationUnitIds.map((id: string) => ({ id: Number(id) })),
                    disconnect: unassignQualificationUnitIds.map((id: string) => ({ id: Number(id) }))
                }
            }
        })

        res.json({
            status: 204,
            success: true,
            message: "Successfully assigned and unassigned qualificationUnit(s)"
        })

    }
    catch (error) {
        next(error)
    }
})

export const TeacherRouter = router;
