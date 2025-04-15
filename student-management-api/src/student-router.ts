import express from "express";
import { pool } from "./postgres-pool.js";
import jwt from "jsonwebtoken";
import { Student } from "sequelize-models";
import { QualificationCompletion } from "sequelize-models/dist/student.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const queryResponse = await pool.query("SELECT u.id, u.first_name as \"firstName\", u.last_name as \"lastName\", u.email, u.phone_number as \"phoneNumber\", u.archived, s.group_id as \"groupId\" FROM users AS u INNER JOIN students AS s ON u.id = s.user_id");

    res.json(queryResponse.rows);
});

router.get("/:id/studying_qualification", async (req, res) => {
    const queryResponse = await pool.query("SELECT qualifications.eperuste_id as id, qualifications.name as name FROM qualifications INNER JOIN students ON qualifications.eperuste_id = students.qualification_id WHERE students.user_id = $1", [req.params.id])

    res.json(queryResponse.rows[0]);
});

router.get("/:id/studying_qualification_title", async (req, res) => {
    const queryResponse = await pool.query("SELECT qualification_titles.eperuste_id as id, qualification_titles.name as name, qualification_titles.qualification_id as \"qualificationId\" FROM qualification_titles INNER JOIN students ON qualification_titles.qualification_id = students.qualification_id WHERE students.user_id = $1", [req.params.id])

    res.json(queryResponse.rows[0]);
});

router.post("/:id/qualification_completion", async (req, res) => {
    const user = jwt.decode(req.headers.authorization) as any;

    if (new Number(req.params.id) != user.id || user.scope != "student") {
        return res.status(403);
    }
    
    await Student.update({
        qualificationCompletion: req.body.qualificationCompletion == "FULL_COMPLETION" ? QualificationCompletion.FullCompletion : QualificationCompletion.PartialCompletion
    }, { where: { id: user.id }});

    res.json({ status: "ok" })
});

export const StudentRouter = router;
