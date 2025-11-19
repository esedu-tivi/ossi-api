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

export const TeacherRouter = router;
