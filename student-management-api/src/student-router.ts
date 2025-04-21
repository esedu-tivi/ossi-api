import express from "express";
import { pool } from "./postgres-pool.js";
import jwt from "jsonwebtoken";
import { AssignedQualificationUnitsForStudents, Qualification, QualificationTitle, QualificationUnit, Student, User } from "sequelize-models";
import { QualificationCompletion } from "sequelize-models/dist/student.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const queryResponse = await pool.query("SELECT u.id, u.first_name as \"firstName\", u.last_name as \"lastName\", u.email, u.phone_number as \"phoneNumber\", u.archived, s.group_id as \"groupId\" FROM users AS u INNER JOIN students AS s ON u.id = s.user_id");

    res.json(queryResponse.rows);
});

router.get("/:id/", async (req, res) => {
    const user = await User.findByPk(req.params.id);
    const student = await Student.findByPk(req.params.id);

    res.json({ ...user.toJSON(), ...student.toJSON() });
});

router.get("/:id/studying_qualification", async (req, res) => {
    const student = await Student.findByPk(req.params.id);
    const studyingQualification = await Qualification.findByPk(student.qualificationId);

    res.json(studyingQualification);
});

router.get("/:id/studying_qualification_title", async (req, res) => {
    const student = await Student.findByPk(req.params.id);
    const studyingQualificationTitle = await QualificationTitle.findByPk(student.qualificationTitleId);

    res.json(studyingQualificationTitle)
});

router.get("/:id/assigned_qualification_units", async (req, res) => {
    const unitIds = (await AssignedQualificationUnitsForStudents.findAll({ where: { studentId: req.params.id } })).map(set => set.qualificationUnitId);
    const units = await QualificationUnit.findAll({ where: { id: unitIds } });

    res.json(units);
});

router.post("/:id/student_setup", async (req, res) => {
    const user = jwt.decode(req.headers.authorization) as any;
    const { qualificationCompletion, qualificationId } = req.body;

    if (new Number(req.params.id) != user.id || user.type != "STUDENT" || user.isSetUp) {
        return res.status(403);
    }

    await Student.update({
        qualificationCompletion: qualificationCompletion,
        qualificationId: qualificationId,
    }, { where: { id: user.id }});

    // assigning TVP for the new student, should make this more modular, if other vocations start using Ossi
    if (qualificationCompletion == "FULL_COMPLETION") {
        await AssignedQualificationUnitsForStudents.create({
            studentId: user.id,
            qualificationUnitId: 6779606
        });
    }

    await User.update({
        isSetUp: true
    }, { where: { id: user.id }});

    res.json({ status: "ok" })
});

export const StudentRouter = router;
