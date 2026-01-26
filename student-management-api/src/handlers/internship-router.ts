import express from "express";
import prisma, { type Internship } from "prisma-orm";
import { parseId } from "../utils/middleware.js";
import type { RequestWithId } from "../types.js";
import { checkIds, NeededType } from "../utils/checkIds.js";

const router = express();

type InternshipWithoutId = Omit<Internship, "id">

router.get("/:id", parseId, async (req: RequestWithId, res, next) => {
  try {
    const internships = await prisma.internship.findMany({
      where: { studentUserId: req.id },
      include: {
        workplace: true,
        jobSupervisor: {
          include: {
            users: true
          }
        },
        teacher: {
          include: {
            users: true
          },
        },
        qualificationUnit: true
      }
    })

    const parsedInternships = internships.map(internship => ({
      id: internship.id,
      info: internship.info,
      startDate: internship.startDate,
      endDate: internship.endDate,
      workplace: internship.workplace ? {
        id: internship.workplace.id || null,
        name: internship.workplace.name || null,
        jobSupervisor: internship.jobSupervisor ? {
          id: internship.jobSupervisor.users.id || null,
          firstName: internship.jobSupervisor.users.firstName || null,
          lastName: internship.jobSupervisor.users.lastName || null,
          email: internship.jobSupervisor.users.email || null,
        } : null,
      } : null,
      teacher: internship.teacher ? {
        id: internship.teacher.users.id || null,
        firstName: internship.teacher.users.firstName || null,
        lastName: internship.teacher.users.lastName || null,
      } : null,
      qualificationUnit: internship.qualificationUnit ? {
        id: internship.qualificationUnit.id || null,
        name: internship.qualificationUnit.name || null,
      } : null,
    }))

    res.json({
      status: 200,
      success: true,
      internships: parsedInternships
    })
  }
  catch (error) {
    next(error)
  }
})

router.post("/", async (req, res, next) => {
  try {
    const { startDate, endDate, info, workplaceId, teacherId, studentId, jobSupervisorId, qualificationUnitId } = req.body.internship

    const parsedInternship: InternshipWithoutId = {
      startDate: new Date(startDate) || null,
      endDate: new Date(endDate) || null,
      info: info || null,
      workplaceId: workplaceId ? Number(workplaceId) : null,
      teacherUserId: teacherId ? Number(teacherId) : null,
      studentUserId: studentId ? Number(studentId) : null,
      jobSupervisorUserId: jobSupervisorId ? Number(jobSupervisorId) : null,
      qualificationUnitId: qualificationUnitId ? Number(qualificationUnitId) : null
    }

    const createdInternship = await prisma.internship.create({
      data: parsedInternship
    })

    console.log("createdInternship:", createdInternship)

    res.json({
      status: 201,
      success: true,
      internship: createdInternship
    })
  }
  catch (error) {
    next(error)
  }
})

router.delete("/:id", parseId, async (req: RequestWithId, res, next) => {
  try {
    await prisma.internship.delete({ where: { id: req.id } })

    res.json({
      status: 204,
      success: true
    })
  }
  catch (error) {
    next(error)
  }
})

router.put("/:id", parseId, async (req: RequestWithId, res, next) => {
  try {
    const { startDate, endDate, info, workplaceId, teacherId, studentId, jobSupervisorId, qualificationUnitId } = req.body.internship

    const parsedInternship: InternshipWithoutId = {
      startDate: new Date(startDate) || null,
      endDate: new Date(endDate) || null,
      info: info || null,
      workplaceId: workplaceId ? Number(workplaceId) : null,
      teacherUserId: teacherId ? Number(teacherId) : null,
      studentUserId: studentId ? Number(studentId) : null,
      jobSupervisorUserId: jobSupervisorId ? Number(jobSupervisorId) : null,
      qualificationUnitId: qualificationUnitId ? Number(qualificationUnitId) : null
    }

    const editedInternship = await prisma.internship.update({
      where: { id: req.id },
      data: parsedInternship,
      include: {
        qualificationUnit: true,
        teacher: {
          include: {
            users: true
          }
        },
        jobSupervisor: {
          include: {
            users: true
          }
        },
        workplace: true,
      }
    })

    const parsedEditedInternship = {
      id: editedInternship.id,
      startDate: editedInternship.startDate || null,
      endDate: editedInternship.endDate || null,
      info: editedInternship.endDate || null,
      workplace: editedInternship.workplace ? {
        ...editedInternship.workplace,
        jobSupervisor: editedInternship.jobSupervisor ? {
          id: editedInternship.jobSupervisor.users.id,
          firstName: editedInternship.jobSupervisor.users.firstName,
          lastName: editedInternship.jobSupervisor.users.lastName,
          email: editedInternship.jobSupervisor.users.email
        } : null
      } : null,
      teacher: editedInternship.teacher ? {
        id: editedInternship.teacher.users.id,
        firstName: editedInternship.teacher.users.firstName,
        lastName: editedInternship.teacher.users.lastName,
        email: editedInternship.teacher.users.email
      } : null,
      qualificationUnit: editedInternship.qualificationUnit ? {
        id: editedInternship.qualificationUnit.id,
        name: editedInternship.qualificationUnit.name
      } : null
    }

    res.json({
      status: 200,
      success: true,
      editedInternship: parsedEditedInternship
    })

  }
  catch (error) {
    next(error)
  }
})

export const InternshipRouter = router
