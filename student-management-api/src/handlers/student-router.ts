import express, { type Request } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { parseId } from "../utils/middleware.js";
import prisma from "prisma-orm";
import { type RequestWithId } from "../types.js";
import type { enumAssignedProjectsForStudentsProjectStatus, enumStudentsQualificationCompletion, enumUsersScope } from "prisma-orm";
import { HttpError } from "../classes/HttpError.js";
import { checkRequiredFields } from "../utils/checkRequiredFields.js";
import { checkIds } from "../utils/checkIds.js";
import { redisPublisher } from "../redis.js";

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

router.get("/", async (req, res) => {
    const students = await prisma.student.findMany()
    const users = await prisma.user.findMany({ where: { id: { in: students.map(student => student.userId) } } })

    res.json({
        status: 200,
        success: true,
        students: students.map(student => ({ ...student, ...users.find(user => user.id == student.userId) }))
    })
})

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

router.get("/:id/studying_qualification", parseId, async (req: RequestWithId, res, next) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.id } })

        if (!student) {
            throw new HttpError(404, "Student not found")
        }

        if (!student.qualificationId) {
            throw new HttpError(404, "qualificationId missing or it's null")
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

router.get("/:id/studying_qualification_title", parseId, async (req: RequestWithId, res, next) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.id } })

        if (!student) {
            throw new HttpError(404, "Student not found")
        }

        if (student.qualificationTitleId === null) {
            res.json()
        } else {
            const studyingQualificationTitle = await prisma.qualificationTitle.findUnique({ where: { id: student.qualificationTitleId } })
            res.json(studyingQualificationTitle)
        }

    } catch (error) {
        next(error)
    }
})

router.get("/:id/assigned_qualification_units", parseId, async (req: RequestWithId, res) => {
    const unitIds = (await prisma.assignedQualificationUnitsForStudent.findMany({ where: { studentId: req.id } })).map(set => set.qualificationUnitId)
    const units = await prisma.qualificationUnit.findMany({ where: { id: { in: unitIds } } })

    res.json(units)
})

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

router.get("/:id/single_assigned_project/:projectId", parseId, async (req: RequestWithId & { params: { projectId: any } }, res, next) => {
    //table assigned_projects_for_students
    try {
        const projectId = req.params.projectId
        checkIds({ projectId })
        const foundAssignedProject = await prisma.assignedProjectsForStudent.findFirst({
            where: {
                studentId: req.id,
                projectId: Number(projectId)
            },
            include: {
                qualificationProjects: true,
                worktimeEntries: {
                    where: {
                        studentId: req.id,
                        projectId: Number(projectId)
                    }
                }
            }
        })

        if (!foundAssignedProject) {
            throw new HttpError(404, "Assignment not found")
        }

        const assignedProject = {
            ...foundAssignedProject,
            parentProject: foundAssignedProject.qualificationProjects
        }
        res.json({
            status: 200,
            success: true,
            project: assignedProject
        })

    } catch (error) {
        console.log(error)
        next(error)
    }
})

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

router.post("/assignProjectToStudent", async (req: RequestWithAssignProjectToStudentBody, res, next) => {
    try {
        // console.log("assign to backend ", req.body.studentId, req.body.projectId)
        const { studentId, projectId } = req.body

        checkIds({ studentId, projectId })

        const parsedStudentId = parseInt(studentId)
        const parsedProjectId = parseInt(projectId)

        const student = await prisma.student.findUnique({ where: { userId: parsedStudentId } })

        if (!student) {
            throw new HttpError(404, "student not found")
        }

        const project = await prisma.qualificationProject.findUnique({ where: { id: parsedProjectId } })

        if (!project) {
            throw new HttpError(404, "project not found")
        }

        const alreadyAssignedProject = await prisma.assignedProjectsForStudent.findFirst({
            where: {
                studentId: parsedStudentId,
                projectId: parsedProjectId
            }
        })

        if (alreadyAssignedProject) {
            throw new HttpError(403, `Already assigned project ${parsedProjectId} to student ${studentId}`)
        }

        const assignedProject = await prisma.assignedProjectsForStudent.create({
            data: {
                studentId: parsedStudentId,
                projectId: parsedProjectId
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

router.delete("/unassignProjectFromStudent", async (req, res, next) => {
    try {
        console.log("removed ", req.body)
        const { studentId, projectId } = req.body

        checkIds({ studentId, projectId })

        const parsedStudentId = parseInt(studentId)
        const parsedProjectId = parseInt(projectId)

        await prisma.$transaction(async transaction => {
            const assignedProject = await transaction.assignedProjectsForStudent.findFirst({
                where: {
                    studentId: parsedStudentId,
                    projectId: parsedProjectId
                }
            })
            if (!assignedProject) {
                throw new HttpError(404, `No assigned project found for student ${studentId} and project ${projectId}`)
            }
            await transaction.assignedProjectsForStudent.delete({
                where: {
                    studentId_projectId: {
                        studentId: parsedStudentId,
                        projectId: parsedProjectId
                    }
                }
            })
        })
        res.json({
            status: 200,
            success: true,
            message: `Successfully unassigned project ${req.body.projectId}`
        })
    } catch (error) {
        next(error)
    }
})

router.post("/createWorktimeEntry", async (req, res, next) => {
    const data = req.body

    const { studentId, projectId } = data
    const requiredFields = ["studentId", "projectId"]
    const missingFields = checkRequiredFields(data, requiredFields)
    try {
        if (!data.entry) {
            throw new HttpError(400, "missing entry object")
        }

        const requiredEntryFields = ["startDate", "endDate", "description"]
        const missingEntryFields = checkRequiredFields(data.entry, requiredEntryFields)

        if (missingFields.length) {
            throw new HttpError(400, `missing fields: ${missingFields}`)
        }
        if (missingEntryFields.length) {
            throw new HttpError(400, `missing entry object fields: ${missingEntryFields}`)
        }

        checkIds({ studentId, projectId })

        const parsedStudentId = parseInt(studentId)
        const parsedProjectId = parseInt(projectId)

        const student = await prisma.user.findFirst({ where: { id: parsedStudentId } })
        if (!student) {
            throw new HttpError(404, "student not found")
        }

        const project = await prisma.qualificationProject.findFirst({ where: { id: parsedProjectId } })
        if (!project) {
            throw new HttpError(404, "project not found")
        }

        const newEntry = await prisma.worktimeEntries.create({
            data: {
                studentId: parsedStudentId,
                projectId: parsedProjectId,
                startDate: data.entry.startDate,
                endDate: data.entry.endDate,
                description: data.entry.description,
            }
        })

        res.json({
            status: 200,
            success: true,
            message: `entered new work entry as ${JSON.stringify(newEntry)}`,
            entry: newEntry
        })
    } catch (error) {
        next(error)
    }
})

router.delete("/deleteWorktimeEntry", async (req, res, next) => {
    const { id } = req.body
    checkIds({ id })
    const parsedId = parseInt(id)
    try {
        const entry = await prisma.$transaction(async transaction => {
            const entry = await transaction.worktimeEntries.findUnique({ where: { id: parsedId } })
            if (!entry) {
                throw new HttpError(404, `No entry found ${parsedId}`)
            }
            await transaction.worktimeEntries.delete({ where: { id: parsedId } })
            return entry
        })
        res.json({
            status: 200,
            success: true,
            message: `Successfully deleted entry ${parsedId}`,
            entry

        })
    } catch (error) {
        next(error)
    }
})

router.put("/updateStudentProject", async (req: RequestWithUpdateStudentProjectBody, res, next) => {
    try {
        // console.log("updateProject: ", req.body)
        const { studentId, projectId, update } = req.body

        checkIds({ studentId, projectId })

        const updateFields = Object.fromEntries(
            Object.entries(update).filter(([_, entry]) => entry !== undefined))

        if (updateFields.projectStatus == "RETURNED") {
            redisPublisher.publish("notification", JSON.stringify({
                recipients: [1], // TODO: put teachers here instead of [1]
                notification: {
                    type: "ProjectReturn",
                    projectId: projectId,
                    returnerStudentId: studentId
                }
            }));
        }

        await prisma.assignedProjectsForStudent.update({
            where: {
                studentId_projectId: {
                    studentId: parseInt(studentId),
                    projectId: parseInt(projectId)
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

router.post("/:id/student_setup", parseId, async (req: StudentSetupWithIdRequest, res, next) => {
    // console.log("setup test ", req.body, req.headers.authorization)
    try {
        const user = jwt.decode(req.headers.authorization) as DecodedJwtPayload;
        const { qualificationCompletion, qualificationId } = req.body;

        const userId = parseInt(user.id)

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
