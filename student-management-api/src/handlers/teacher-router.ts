import express from "express";
import { Teacher, User } from "sequelize-models";

const router = express.Router();

router.get("/:id/", async (req, res) => {
    const user = await User.findByPk(req.params.id);
    const teacher = await Teacher.findByPk(req.params.id);

    res.json({ ...user, ...teacher });
});

export const TeacherRouter = router;
