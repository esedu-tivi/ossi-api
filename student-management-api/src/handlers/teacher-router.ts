import express from "express";
import { parseId } from "../utils/middleware";
import prisma from "../prisma-client";
import { RequestWithId } from "../types";

const router = express.Router();

router.get("/:id/", parseId, async (req: RequestWithId, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.id } })
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.id } });

    res.json({
        status: 200,
        success: true,
        teacher: { ...user, ...teacher }
    });
});

export const TeacherRouter = router;
