import express, { type NextFunction, type Response } from "express";
import { parseId } from "../utils/middleware.js";
import prisma from "prisma-orm";
import { type RequestWithId } from "../types.js";
import { checkIds } from "../utils/checkIds.js";
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

        checkIds({ projectId })

        const response = await prisma.teacher.update({
            where: { userId: req.id },
            data: {
                teachingQualificationProject: {
                    connect: { id: Number(projectId) }
                }
            }
        })
        res.json({
            status: 200,
            success: true,
            message: "Successfully assigned project"
        })

    } catch (error) {
        console.error(error)
        next(error)
    }
})

export const TeacherRouter = router;
