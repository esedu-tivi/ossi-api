import express from "express";
import prisma from "prisma-orm";
import { HttpError } from "../classes/HttpError.js";

const router = express();

router.get("/", async (req, res, next) => {
  try {
    const workplaces = await prisma.workplace.findMany()

    res.json({
      status: 200,
      success: true,
      workplaces
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

export const WorkplaceRouter = router
