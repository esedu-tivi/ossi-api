import express, { Request } from "express";
//import { pool } from "../postgres-pool.js";
import jwt, { JwtPayload } from "jsonwebtoken";
// import { AssignedQualificationUnitsForStudents, AssignedProjectsForStudents, MandatoryQualificationUnitsForTitle, Qualification, QualificationProject, QualificationTitle, QualificationUnit, Student, User, sequelize, } from "sequelize-models";
// import { QualificationCompletion } from "sequelize-models/dist/student.js";
import { beginTransaction, commitTransaction, parseId } from "../utils/middleware.js";
import prisma from "../prisma-client.js";
import { RequestWithId } from "../types.js";
import { enumAssignedProjectsForStudentsProjectStatus, enumStudentsQualificationCompletion, enumUsersScope } from "prisma-orm";
import { HttpError } from "../classes/HttpError.js";

const router = express.Router();

interface RequestWithAssignProjectToStudentBody extends Request {
    body: {
        studentId: string,
        projectId: string,
    }
}

interface RequestWithUpdateStudentProjectBody extends Request {
    body: {
        studentId: string,
        projectId: string,
        update: {
            projectPlan?: string
            projectReport?: string
            projectStatus?: enumAssignedProjectsForStudentsProjectStatus
        }
    }
}

interface DecodedJwtPayload extends JwtPayload {
    user: {
        id: number
        type: enumUsersScope,
        isSetup: boolean
    }
}

interface StudentSetupWithIdRequest extends RequestWithId {
    body: {
        qualificationCompletion: enumStudentsQualificationCompletion
        qualificationId: string
    }
}

/*
router.get("/", async (req, res) => {
    const students = await Student.findAll();
    const users = await User.findAll({ where: { id: students.map(student => student.id) } });

    res.json({
        status: 200,
        success: true,
        students: students.map(student => ({ ...student.toJSON(), ...users.find(user => user.id == student.id).toJSON() }))
    });
});
*/

router.get("/", async (req, res) => {
    const students = await prisma.student.findMany()
    const users = await prisma.user.findMany({ where: { id: { in: students.map(student => student.userId) } } })

    res.json({
        status: 200,
        success: true,
        students: students.map(student => ({ ...student, ...users.find(user => user.id == student.userId) }))
    })
})

/*
router.get("/:id", async (req, res) => {
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
*/

router.get("/:id", parseId, async (req: RequestWithId, res, next) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.id } })
        const student = await prisma.student.findUnique({ where: { userId: req.id } })
        console.log(user, student)

        if (!user || !student) {
            throw new HttpError(404, "User or student not found")
        }

        res.json({
            status: 200,
            success: true,
            student: { ...user, ...student }
        })
    } catch (error) {
        next(error)
    }
})

/*
router.get("/:id/studying_qualification", async (req, res) => {
    const student = await Student.findByPk(req.params.id);
    const studyingQualification = await Qualification.findByPk(student.qualificationId);

    res.json(studyingQualification);
});
 */

router.get("/:id/studying_qualification", parseId, async (req: RequestWithId, res, next) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.id } })

        if (!student) {
            throw new HttpError(404, "Student not found")
        }

        const studyingQualification = await prisma.qualification.findFirst({ where: { id: student.qualificationId } })

        if (!studyingQualification) {
            throw new HttpError(404, "Studying qualification not found")
        }

        res.json(studyingQualification)
    } catch (error) {
        next(error)
    }
})

/*
router.get("/:id/studying_qualification_title", async (req, res) => {
    const student = await Student.findByPk(req.params.id);
    const studyingQualificationTitle = await QualificationTitle.findByPk(student.qualificationTitleId);

    res.json(studyingQualificationTitle)
});
*/

router.get("/:id/studying_qualification_title", parseId, async (req: RequestWithId, res, next) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.id } })

        if (!student) {
            throw new HttpError(404, "Student not found")
        }

        const studyingQualificationTitle = await prisma.qualificationTitle.findUnique({ where: { id: student.qualificationTitleId } })

        res.json(studyingQualificationTitle)
    } catch (error) {
        next(error)
    }
})

/*
router.get("/:id/assigned_qualification_units", async (req, res) => {
    const unitIds = (await AssignedQualificationUnitsForStudents.findAll({ where: { studentId: req.params.id } })).map(set => set.qualificationUnitId);
    const units = await QualificationUnit.findAll({ where: { id: unitIds } });

    res.json(units);
});
*/

router.get("/:id/assigned_qualification_units", parseId, async (req: RequestWithId, res) => {
    const unitIds = (await prisma.assignedQualificationUnitsForStudent.findMany({ where: { studentId: req.id } })).map(set => set.qualificationUnitId)
    const units = await prisma.qualificationUnit.findMany({ where: { id: { in: unitIds } } })

    res.json(units)
})

/*
router.get("/:id/assigned_projects", async (req, res) => {
    //table assigned_projects_for_students
    console.log("log from assigned_projects pre",)

    const assignedProjects = await AssignedProjectsForStudents.findAll({
        where: { studentId: req.params.id },
        include: [{ model: QualificationProject, as: "parentProject" }],
        transaction: res.locals._transaction
    });
    // const projects = await QualificationProject.findAll({ where: { id: projectIds } });
    console.log("log from assigned_projects post ", { ...assignedProjects })
    res.json(assignedProjects);
});
*/

router.get("/:id/assigned_projects", parseId, async (req: RequestWithId, res) => {
    //table assigned_projects_for_students

    const foundAssignedProjects = await prisma.assignedProjectsForStudent.findMany({
        where: { studentId: req.id },
        include: {
            qualificationProjects: true,
            worktimeEntries: true
        }
    })

    //rename qualificationProjects to the parentProject
    const assignedProjects = foundAssignedProjects.map(({ qualificationProjects, ...rest }) => ({ ...rest, parentProject: qualificationProjects }))

    console.log("log from assigned_projects post ", { ...assignedProjects })

    res.json(assignedProjects)
})

/*
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
*/

router.post("/:id/qualification_title", parseId, async (req: RequestWithId, res, next) => {
    try {
        const { qualificationTitleId } = req.body

        if (Number.isNaN(qualificationTitleId)) {
            throw new HttpError(400, "qualificationTitleId missing or it is not number")
        }

        await prisma.$transaction(async (transaction) => {
            const student = await transaction.student.findUnique({ where: { userId: req.id } })

            if (!student) {
                throw new HttpError(404, "student not found")
            }

            const foundQualificationTitle = await transaction.qualificationTitle.findFirst({ where: { id: qualificationTitleId } })

            if (!foundQualificationTitle) {
                throw new HttpError(404, "qualificationTitle not found")
            }

            await transaction.student.update({
                where: { userId: req.id },
                data: {
                    qualificationTitleId: Number(qualificationTitleId)
                }
            })

            if (student.qualificationTitleId) {
                // revert previous title units
                const previousTitleUnits = (await transaction.mandatoryQualificationUnitsForTitle.findMany({
                    where: {
                        titleId: student.qualificationTitleId
                    }
                })).map(unitsForTitle => unitsForTitle.unitId)

                console.log('previousTitleUnits', previousTitleUnits)

                await transaction.assignedQualificationUnitsForStudent.deleteMany({
                    where: {
                        studentId: req.id,
                        qualificationUnitId: { in: previousTitleUnits }
                    }
                })
            }

            // const titleUnits = await transaction.mandatoryQualificationUnitsForTitle.findMany({
            //     where: { titleId: qualificationTitleId }
            // })

            // const qualificationUnitsToAssign = titleUnits.map(titleUnit => ({
            //     studentId: req.id,
            //     qualificationTitleId: titleUnit.unitId
            // }))

            // await transaction.assignedQualificationUnitsForStudent.createMany({
            //     data: qualificationUnitsToAssign
            // })
        })

        res.json({
            status: 200,
            success: true,
        })

    } catch (error) {
        next(error)
    }
})

/*
router.post("/assignProjectToStudent", beginTransaction, async (req, res, next) => {
    try {
        // console.log("assign to backend ", req.body.studentId, req.body.projectId)
        const assignedProject = await sequelize.transaction(async t => {
            const newProject = await AssignedProjectsForStudents.create({
                studentId: req.body.studentId,
                projectId: req.body.projectId
            }, {
                transaction: t,
                returning: true
            },)
            return newProject
        });
        console.log(assignedProject)
        res.json({
            status: 200,
            success: true,
            message: "Successfully added project"
        });
    } catch (e) {
        // console.log("projectAssign error: ", e)
        next(e);
    }
})
*/

router.post("/assignProjectToStudent", async (req: RequestWithAssignProjectToStudentBody, res, next) => {
    try {
        // console.log("assign to backend ", req.body.studentId, req.body.projectId)
        const { studentId, projectId } = req.body

        if (Number.isNaN(studentId)) {
            throw new HttpError(400, "studentId missing or it's not number")
        }

        if (Number.isNaN(studentId)) {
            throw new HttpError(400, "projectId missing or it's not number")
        }

        const student = await prisma.student.findUnique({ where: { userId: Number(studentId) } })

        if (!student) {
            throw new HttpError(400, "student not found")
        }

        const assignedProject = await prisma.assignedProjectsForStudent.create({
            data: {
                studentId: Number(studentId),
                projectId: Number(projectId)
            }
        })

        console.log(assignedProject)
        res.json({
            status: 200,
            success: true,
            message: "Successfully added project"
        })

    } catch (error) {
        // console.log("projectAssign error: ", error)
        next(error);
    }
})

/*
router.put("/updateStudentProject", async (req, res, next) => {
    //https://sequelize.org/docs/v6/other-topics/transactions/#managed-transactions
    try {
        // console.log("updateProject: ", req.body)
        const update = req.body.update

        const updateFields = Object.fromEntries(
            Object.entries(update).filter(([_, entry]) => entry !== undefined))
        // console.log(updateFields)

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
            // console.log("using data ", req.body)
            return studentProject
        })
        // console.log(updatedStudentProject)

        res.json({
            status: 200,
            success: true,
            message: `Succesfully updated project`,

        });
    } catch (e) {
        // console.log("projectUpdate error: ", e)
        next(e);
    }
},)
*/

router.put("/updateStudentProject", async (req: RequestWithUpdateStudentProjectBody, res, next) => {
    //https://sequelize.org/docs/v6/other-topics/transactions/#managed-transactions
    try {
        // console.log("updateProject: ", req.body)
        const { studentId, projectId, update } = req.body

        if (Number.isNaN(studentId)) {
            throw new HttpError(400, "studentId missing or it's not number")
        }

        if (Number.isNaN(projectId)) {
            throw new HttpError(400, "projectId missing or it's not number")
        }

        const updateFields = Object.fromEntries(
            Object.entries(update).filter(([_, entry]) => entry !== undefined))
        // console.log(updateFields)

        await prisma.assignedProjectsForStudent.update({
            where: {
                studentId_projectId: {
                    studentId: Number(studentId),
                    projectId: Number(projectId)
                }
            },
            data: updateFields
        })

        res.json({
            status: 200,
            success: true,
            message: `Successfully updated project`,

        })
    } catch (error) {
        // console.log("projectUpdate error: ", e)
        next(error)
    }
})


/* router.post("/:id/student_setup", beginTransaction, async (req, res, next) => {
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
}, commitTransaction); */


router.post("/:id/student_setup", parseId, async (req: StudentSetupWithIdRequest, res, next) => {
    // console.log("setup test ", req.body, req.headers.authorization)
    try {
        const user = jwt.decode(req.headers.authorization) as DecodedJwtPayload;
        const { qualificationCompletion, qualificationId } = req.body;

        const userId = Number(user.id)

        if (req.id !== userId) {
            throw new HttpError(401, "The user requesting student setup does not match with the student.")
        }

        if (user.type === "STUDENT") {
            if (user.type !== "STUDENT") {
                throw new HttpError(401, "The user requesting student setup is not a student.")
            }

            if (user.isSetUp) {
                throw new HttpError(401, "The student has already been set up.")
            }
            // console.log("setup pre-student update ", qualificationCompletion, qualificationId, user.id)

            await prisma.$transaction(async (transaction) => {
                await transaction.student.update({
                    where: { userId: userId },
                    data: {
                        qualificationCompletion: qualificationCompletion,
                        qualificationId: Number(qualificationId)
                    }
                })

                // assigning TVP for the new student, should make this more modular, if other vocations start using Ossi
                if (qualificationCompletion === "FULL_COMPLETION") {
                    await transaction.assignedQualificationUnitsForStudent.create({
                        data: {
                            studentId: userId,
                            qualificationUnitId: 6779606
                        }
                    })
                }

                // console.log("setup test pre-user update ")
                await transaction.user.update({
                    where: { id: userId },
                    data: { isSetUp: true }
                })
            })

        }

        res.json({
            status: 200,
            success: true
        })

    } catch (error) {
        next(error)
    }
})

export const StudentRouter = router;
