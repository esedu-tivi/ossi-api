import express from "express";
import { pool } from "../postgres-pool.js";
import jwt from "jsonwebtoken";
import { AssignedQualificationUnitsForStudents, AssignedProjectsForStudents, MandatoryQualificationUnitsForTitle, Qualification, QualificationProject, QualificationTitle, QualificationUnit, Student, User, sequelize, } from "sequelize-models";
import { QualificationCompletion } from "sequelize-models/dist/student.js";
import { beginTransaction, commitTransaction } from "../utils/middleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const students = await Student.findAll();
    const users = await User.findAll({ where: { id: students.map(student => student.id) } });

    res.json({
        status: 200,
        success: true,
        students: students.map(student => ({ ...student.toJSON(), ...users.find(user => user.id == student.id).toJSON() }))
    });
});

router.get("/:id/", async (req, res) => {
    const user = await User.findByPk(req.params.id);
    const student = await Student.findByPk(req.params.id);

    res.json({
        status: 200,
        success: true,
        student: { ...user.toJSON(), ...student.toJSON() }
    });
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

router.get("/:id/assigned_projects", async (req, res) => {
    //table assigned_projects_for_students
    console.log("Student id ", req.params)
    const assignedProjects = await AssignedProjectsForStudents.findAll({ where: { studentId: req.params.id } });
    // const projects = await QualificationProject.findAll({ where: { id: projectIds } });
    console.log("project returns ", assignedProjects)
    res.json(assignedProjects);
});


router.post("/:id/qualification_title", beginTransaction, async (req, res, next) => {
    try {
        const { qualificationTitleId } = req.body;

        await Student.update({ qualificationTitleId: qualificationTitleId },
            {
                transaction: res.locals._transaction,
                where: { id: req.params.id }
            }
        );

        const student = await Student.findByPk(req.params.id);

        // revert previous title units
        if (student.qualificationTitleId != null) {
            const previousTitleUnits = (await MandatoryQualificationUnitsForTitle.findAll({
                where: {
                    titleId: student.qualificationTitleId
                }
            })).map(unitsForTitle => unitsForTitle.unitId);

            await AssignedQualificationUnitsForStudents.destroy({
                where: {
                    studentId: req.params.id,
                    qualificationUnitId: previousTitleUnits
                }
            });
        }

        const titleUnits = await MandatoryQualificationUnitsForTitle.findAll({ where: { titleId: qualificationTitleId }, transaction: res.locals._transaction });

        await AssignedQualificationUnitsForStudents.bulkCreate(titleUnits.map(titleUnit => ({
            studentId: parseInt(req.params.id),
            qualificationUnitId: titleUnit.unitId
        })), { transaction: res.locals._transaction });
        res.json({
            status: 200,
            success: true,
        });
    } catch (e) {
        next(e);
    }
});
router.post("/assignProjectToStudent", beginTransaction, async (req, res, next) => {
    try {

        console.log("assign to backend ", req.body)
        await AssignedProjectsForStudents.create({
            studentId: parseInt(req.body.studentId),
            projectId: parseInt(req.body.projectId)
        }, { transaction: res.locals._transaction },)
        const student = await Student.findByPk(req.body.studentId)
        console.log(student)
        res.json({
            status: 200,
            success: true,
            message: "",
        });
    } catch (e) {
        console.log("projectAssign error: ", e)
        next(e);
    }
})
router.put("/updateStudentProject", async (req, res, next) => {
    //https://sequelize.org/docs/v6/other-topics/transactions/#managed-transactions
    try {
        console.log("updateProject: ", req.body)
        const update = req.body.update

        const updateFields = Object.fromEntries(
            Object.entries(update).filter(([_, entry]) => entry !== undefined))
        console.log(updateFields)

        const updatedStudentProject = await sequelize.transaction(async t => {

            const studentProject = AssignedProjectsForStudents.update(
                updateFields,
                {
                    where: {
                        studentId: parseInt(req.body.studentId),
                        projectId: parseInt(req.body.projectId)
                    }, transaction: res.locals._transaction,
                    returning: true
                })
            // .then(function (result) { console.log("mutations ", result, result[0], result[1]) })
            // console.log("changed lines ", result)
            console.log("using data ", req.body)
            return studentProject
        })
        console.log(updatedStudentProject)

        res.json({
            status: 200,
            success: true,
            message: `Succesfully updated project`,

        });
    } catch (e) {
        console.log("projectUpdate error: ", e)
        next(e);
    }
},)


router.post("/:id/student_setup", beginTransaction, async (req, res, next) => {
    try {
        const user = jwt.decode(req.headers.authorization) as any;
        const { qualificationCompletion, qualificationId } = req.body;

        if (req.params.id != user.id) {
            res.json({
                status: 401,
                success: false,
                message: "The user requesting student setup does not match with the student."
            });


            throw Error();
        }

        if (user.type != "STUDENT") {
            if (user.type != "STUDENT") {
                res.json({
                    status: 401,
                    success: false,
                    message: "The user requesting student setup is not a student."
                });


                throw Error();
            }

            if (user.isSetUp) {
                res.json({
                    status: 401,
                    success: false,
                    message: "The student has already been set up."
                });

                throw Error();
            }

            await Student.update({
                qualificationCompletion: qualificationCompletion,
                qualificationId: qualificationId,
            }, { where: { id: user.id }, transaction: res.locals._transaction });

            // assigning TVP for the new student, should make this more modular, if other vocations start using Ossi
            if (qualificationCompletion == "FULL_COMPLETION") {
                await AssignedQualificationUnitsForStudents.create({
                    studentId: user.id,
                    qualificationUnitId: 6779606
                }, { transaction: res.locals._transaction });
            }

            await User.update({
                isSetUp: true
            }, { where: { id: user.id }, transaction: res.locals._transaction });

            res.json({
                status: 200,
                success: true
            });

            next();
        }
    } catch (e) {
        next(e)
    }
}, commitTransaction);

export const StudentRouter = router;
