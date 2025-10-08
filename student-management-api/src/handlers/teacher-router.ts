import express, { Request } from "express";
//import { Teacher, User } from "sequelize-models";
import { parseId } from "../utils/middleware";
import prisma from "../prisma-client";
import { RequestWithId } from "../types";

const router = express.Router();

/*
router.get("/:id/", async (req, res) => {
    const user = await User.findByPk(req.params.id);
    const teacher = await Teacher.findByPk(req.params.id);

    res.json({
        status: 200,
        success: true,
        teacher: { ...user.toJSON(), ...teacher.toJSON() }
    });
});
*/

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
