import express from "express";
import { checkRequiredFields } from "../utils/checkRequiredFields.js";
import { v7 as uuidv7 } from 'uuid'
import prisma, { enumUsersScope } from "prisma-orm";
import type { RequestWithId } from "../types.js";
import { parseId } from "../utils/middleware.js";
import { HttpError } from "../classes/HttpError.js";

const router = express()

router.get("/", async (req, res, next) => {
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
      phoneNumber: jobSupervisor.users.phoneNumber,
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

router.post("/", async (req, res, next) => {
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

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params

    await prisma.user.delete({
      where: {
        id: Number(id)
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

router.put("/:id", parseId, async (req: RequestWithId, res, next) => {
  const { jobSupervisor } = req.body

  const missingFields = checkRequiredFields(jobSupervisor, ["firstName", "lastName", "email"])

  if (missingFields.length) {
    throw new HttpError(400, `missing required fields: ${missingFields}`)
  }

  await prisma.user.update({
    where: {
      id: req.id
    },
    data: {
      firstName: jobSupervisor.firstName,
      lastName: jobSupervisor.lastName,
      email: jobSupervisor.email,
      phoneNumber: jobSupervisor.phoneNumber || ""
    }
  })

  res.json({
    status: 200,
    success: true,
  })
})

export const JobSupervisorRouter = router
