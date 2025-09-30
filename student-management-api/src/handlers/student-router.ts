import express from "express";
import jwt from "jsonwebtoken";
import { AssignedQualificationUnitsForStudents, AssignedProjectsForStudents, MandatoryQualificationUnitsForTitle, Qualification, QualificationProject, QualificationTitle, QualificationUnit, Student, User, WorktimeEntries, sequelize, } from "sequelize-models";
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
    // console.log(user, student)

    if (!user || !student) {
        return res.status(404).json({
            status: 404,
            success: false,
            message: "User or student not found"
        });
    }

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
    const assignedProjects = await AssignedProjectsForStudents.findAll({
        where: { studentId: req.params.id },
        include: [
            { model: QualificationProject, as: "parentProject" },
            {
                model: WorktimeEntries,
                as: "worktimeEntries",
                where: sequelize.literal(
                    `"worktimeEntries"."student_id" = "AssignedProjectsForStudents"."student_id" AND "worktimeEntries"."project_id" = "AssignedProjectsForStudents"."project_id"`
                ),
                required: false
            }
        ],
        transaction: res.locals._transaction
    });
    res.json(assignedProjects);
});
router.get("/:id/single_assigned_project/:projectId", async (req, res, next) => {
    //table assigned_projects_for_students
    try {
        const assignedProject = await AssignedProjectsForStudents.findOne({
            where: {
                studentId: req.params.id,
                projectId: req.params.projectId
            },
            include: [
                {
                    model: QualificationProject,
                    as: "parentProject"
                },
                {
                    model: WorktimeEntries,
                    as: "worktimeEntries",
                    where: sequelize.literal(
                        `"worktimeEntries"."student_id" = "AssignedProjectsForStudents"."student_id" AND "worktimeEntries"."project_id" = "AssignedProjectsForStudents"."project_id"`
                    ),
                    required: false
                }
            ],
        });
        if (assignedProject) {
            res.json({
                status: 200,
                success: true,
                project: assignedProject
            });
        } else {
            res.json({
                status: 404,
                success: false,
                message: "Assignment not found"
            });
        }
    } catch (e) {
        console.log(e)
        next(e)
    }
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

        if (!req.body.studentId || !req.body.projectId) {
            res.json({
                status: 400,
                success: false,
                message: "Missing required fields"
            });
        } else {
            const project = await QualificationProject.findByPk(req.body.projectId);
            // prototype to take project duration in hours, divide it to 8h working days, then add to now date to get deadline
            const durationDays = Math.ceil(project.duration / 8);
            console.log(durationDays)
            const assignedProject = await sequelize.transaction(async t => {
                const newProject = await AssignedProjectsForStudents.create({
                    studentId: req.body.studentId,
                    projectId: req.body.projectId,
                    startDate: new Date(),
                    deadlineDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
                }, {
                    transaction: t,
                    returning: true
                },)
                return newProject
            });
            res.json({
                status: 200,
                success: true,
                message: "Successfully added project"
            });
        }
    } catch (e) {
        next(e);
    }
})

router.delete("/unassignProjectFromStudent", async (req, res, next) => {
    //https://sequelize.org/docs/v6/other-topics/transactions/#managed-transactions
    try {
        await sequelize.transaction(async t => {
            const entryToDelete = await AssignedProjectsForStudents.findOne({
                where: {
                    studentId: parseInt(req.body.studentId),
                    projectId: parseInt(req.body.projectId)
                }
            })
            if (entryToDelete) {
                await WorktimeEntries.destroy({
                    where: {
                        studentId: parseInt(req.body.studentId),
                        projectId: parseInt(req.body.projectId)
                    },
                    transaction: t
                });
                await entryToDelete.destroy({ transaction: t });
                res.json({
                    status: 200,
                    success: true,
                    message: `Successfully unassigned project ${req.body.projectId}`
                });
            } else {
                res.json({
                    status: 404,
                    success: false,
                    message: `No assigned project found for student ${req.body.studentId} and project ${req.body.projectId}`
                });
            }
        });
    } catch (e) {
        next(e);
    }

})

router.put("/updateStudentProject", async (req, res, next) => {
    //https://sequelize.org/docs/v6/other-topics/transactions/#managed-transactions
    try {
        const update = req.body.update
        const updateFields = Object.fromEntries(
            Object.entries(update).filter(([_, entry]) => entry !== undefined))
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
            return studentProject
        })
        res.json({
            status: 200,
            success: true,
            message: `Succesfully updated project`,
        });
    } catch (e) {
        next(e);
    }
})

router.post("/createWorktimeEntry", async (req, res, next) => {
    const data = req.body
    try {
        await sequelize.transaction(async t => {
            const newEntry = await WorktimeEntries.create({
                studentId: data.studentId,
                projectId: data.projectId,
                startDate: data.entry.startDate,
                endDate: data.entry.endDate,
                description: data.entry.description,
            }, {
                transaction: t,
            });
            res.json({
                status: 200,
                success: true,
                message: `entered new work entry as ${JSON.stringify(newEntry)}`,
                entry: newEntry
            });
        });
    } catch (e) {
        next(e);
    }
})

router.delete("/deleteWorktimeEntry", async (req, res, next) => {
    const data = req.body
    try {
        await sequelize.transaction(async t => {
            const entry = await WorktimeEntries.findByPk(data.id, { transaction: t });
            if (entry) {
                const copyOfEntry = entry
                await entry.destroy({ transaction: t });
                res.json({
                    status: 200,
                    success: true,
                    message: `Successfully deleted entry ${data.id}`,
                    entry: copyOfEntry

                });
            } else {
                res.json({
                    status: 404,
                    success: false,
                    message: `No entry found ${data.id}`

                });
            }
        });
    } catch (e) {
        next(e);
    }
})


router.post("/:id/student_setup", beginTransaction, async (req, res, next) => {
    // console.log("setup test ", req.body, req.headers.authorization)
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

        if (user.type == "STUDENT") {
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
            // console.log("setup pre-student update ", qualificationCompletion, qualificationId, user.id)
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
            // console.log("setup test pre-user update ")
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
