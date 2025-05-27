import express from "express";
import { Teacher, User } from "sequelize-models";

const router = express.Router();

router.get("/:id/", async (req, res) => {
    const user = await User.findByPk(req.params.id);
    const teacher = await Teacher.findByPk(req.params.id);

    res.json({
        status: 200,
        success: true,
        teacher: { ...user.toJSON(), ...teacher.toJSON() }
    });
});

export const TeacherRouter = router;
