import express from "express";
import prisma, { type Internship } from "prisma-orm";
import { parseId } from "../utils/middleware.js";
import type { RequestWithId } from "../types.js";

const router = express();

type InternshipWithoutId = Omit<Internship, "id">

router.get("/:id", parseId, async (req: RequestWithId, res, next,) => {
  try {
    const internships = await prisma.internship.findMany({
      where: { studentUserId: req.id }
    })

    res.json({
      status: 200,
      success: true,
      internships
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

export const InternshipRouter = router
