import express from "express";
import prisma, { enumUsersScope } from "prisma-orm";
import { HttpError } from "../classes/HttpError.js";
import { parseId } from "../utils/middleware.js";
import type { RequestWithId } from "../types.js";
import { checkIds, NeededType } from "../utils/checkIds.js";
import { checkRequiredFields } from "../utils/checkRequiredFields.js";
import { v7 as uuidv7 } from 'uuid'

const router = express();

interface RequestWithIdAndJobSupervisorId extends RequestWithId {
  body: {
    jobSupervisorId: string
  }
}

router.get("/", async (req, res, next) => {
  try {
    const workplaces = await prisma.workplace.findMany({
      orderBy: { id: 'asc' },
      include: {
        jobSupervisor: {
          include: {
            users: true
          }
        }
      }
    })

    const parsedWorkplaces = workplaces.map(workplace => ({
      ...workplace,
      jobSupervisors: workplace.jobSupervisor.map(supervisor => ({
        id: supervisor.users.id,
        firstName: supervisor.users.firstName,
        lastName: supervisor.users.lastName,
        email: supervisor.users.email,
      }))
    }))

    res.json({
      status: 200,
      success: true,
      workplaces: parsedWorkplaces
    })
  }
  catch (error) {
    next(error)
  }
})

router.post("/", async (req, res, next) => {
  try {
    const { name } = req.body
    if (!name || name === '') {
      throw new HttpError(400, `missing 'name' field or it contains empty string`)
    }

    const createdWorkplace = await prisma.workplace.create({
      data: {
        name
      }
    })

    res.json({
      status: 201,
      success: true,
      workplace: createdWorkplace
    })
  }
  catch (error) {
    next(error)
  }
})

router.put("/:id", parseId, async (req: RequestWithId, res, next) => {
  try {
    const { name } = req.body

    if (!name || name === '') {
      throw new HttpError(400, `missing 'name' field or it contains empty string`)
    }

    const editedWorkplace = await prisma.workplace.update({
      where: { id: req.id },
      data: { name }
    })

    res.json({
      status: 200,
      success: true,
      editedWorkplace: editedWorkplace
    })

  }
  catch (error) {
    next(error)
  }
})

router.delete("/:id", parseId, async (req: RequestWithId, res, next) => {
  try {
    await prisma.workplace.delete({ where: { id: req.id } })

    res.json({
      status: 204,
      success: true,
    })
  }
  catch (error) {
    next(error)
  }
})

router.post("/:id/assignJobSupervisor", parseId, async (req: RequestWithIdAndJobSupervisorId, res, next) => {
  try {
    const { jobSupervisorId } = req.body
    checkIds({ jobSupervisorId }, NeededType.NUMBER)
    await prisma.workplace.update({
      where: {
        id: req.id
      },
      data: {
        jobSupervisor: {
          connect: {
            userId: Number(jobSupervisorId)
          }
        }
      }
    })

    res.json({
      status: 201,
      success: true
    })
  }
  catch (error) {
    next(error)
  }
})

router.delete("/:id/unassignJobSupervisor", parseId, async (req: RequestWithIdAndJobSupervisorId, res, next) => {
  try {
    const { jobSupervisorId } = req.body
    checkIds({ jobSupervisorId }, NeededType.NUMBER)
    await prisma.workplace.update({
      where: {
        id: req.id
      },
      data: {
        jobSupervisor: {
          disconnect: {
            userId: Number(jobSupervisorId)
          }
        }
      }
    })
    res.json({
      status: 204,
      success: true
    })
  }
  catch (error) {
    next(error)
  }

})

router.get("/jobSupervisors", async (req, res, next) => {
  try {
    const jobSupervisors = await prisma.jobSupervisor.findMany({
      select: {
        users: true,
        workplace: true
      }
    })

    const parsedJobSupervisors = jobSupervisors.map(jobSupervisor => ({
      id: jobSupervisor.users.id,
      firstName: jobSupervisor.users.firstName,
      lastName: jobSupervisor.users.lastName,
      email: jobSupervisor.users.email,
      archived: jobSupervisor.users.archived,
      workplace: jobSupervisor.workplace
    }))


    res.json({
      status: 200,
      success: true,
      jobSupervisors: parsedJobSupervisors
    })
  }
  catch (error) {
    next(error)
  }
})

router.post("/jobSupervisor", async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNumber } = req.body.jobSupervisor

    const missingFields = checkRequiredFields({ firstName, lastName, email }, ["firstName", "lastName", "email"])
    if (missingFields.length) {
      return res.json({
        status: 400,
        success: false,
        message: ``
      })
    }

    const jobSupervisor = {
      firstName,
      lastName,
      email,
      phoneNumber: phoneNumber || "",
      oid: uuidv7(), //Needed only for fulfill database requirements
      scope: enumUsersScope.JOB_SUPERVISOR
    }

    const createdJobSupervisor = await prisma.user.create({
      data: {
        ...jobSupervisor,
        jobSupervisors: {
          create: {}
        }
      }
    })

    res.json({
      status: 201,
      success: true,
      createdJobSupervisor: {
        id: createdJobSupervisor.id,
        firstName: createdJobSupervisor.firstName,
        lastName: createdJobSupervisor.lastName,
        email: createdJobSupervisor.email,
        phoneNumber: createdJobSupervisor.phoneNumber || null
      }
    })
  }
  catch (error) {
    next(error)
  }

})

router.delete("/jobSupervisor/:id", async (req, res, next) => {
  try {
    const { id } = req.params

    await prisma.jobSupervisor.delete({
      where: {
        userId: Number(id)
      }
    })
    res.json({
      status: 204,
      success: true
    })
  }
  catch (error) {
    next(error)
  }
})

router.get("/:id/jobSupervisors", parseId, async (req: RequestWithId, res, next) => {
  try {
    const jobSupervisors = await prisma.jobSupervisor.findMany({
      where: { workplaceId: req.id },
      select: { users: true }
    })

    const parsedJobSupervisors = jobSupervisors.map(jobSupervisor => ({
      id: jobSupervisor.users.id,
      firstName: jobSupervisor.users.firstName,
      lastName: jobSupervisor.users.lastName,
      email: jobSupervisor.users.email,
    }))

    res.json({
      status: 200,
      success: true,
      jobSupervisors: parsedJobSupervisors
    })
  }
  catch (error) {
    next(error)
  }
})

router.patch("/:id/updateJobSupervisorAssigns", parseId, async (req: RequestWithId, res, next) => {
  try {
    const { assignIds, unassignIds } = req.body

    checkIds(assignIds, NeededType.NUMBER)
    checkIds(unassignIds, NeededType.NUMBER)

    await prisma.workplace.update({
      where: { id: req.id },
      data: {
        jobSupervisor: {
          connect: assignIds.map((id: string) => ({ userId: Number(id) })),
          disconnect: unassignIds.map((id: string) => ({ userId: Number(id) }))
        }
      }
    })
    res.json({
      status: 204,
      success: true,
      message: "Successfully assigned and unassigned jobSupervisor(s)"
    })
  }
  catch (error) {
    next(error)
  }
})

export const WorkplaceRouter = router
