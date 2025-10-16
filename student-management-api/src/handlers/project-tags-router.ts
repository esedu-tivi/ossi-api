import express from "express";
import prisma from "../prisma-client.js";
import { HttpError } from "../classes/HttpError.js";

const router = express();

router.get("/", async (req, res, next) => {
    try {
        const tags = await prisma.qualificationProjectTag.findMany()

        res.json({
            status: 200,
            success: true,
            tags: tags
        });

    }
    catch (e) {
        next(e);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { name } = req.body

        if (!name || name === '') {
            throw new HttpError(400, `tagName missing or it's empty.`)
        }

        const tag = await prisma.qualificationProjectTag.create({
            data: {
                name: name
            }
        })

        res.json({
            status: 200,
            success: true,
            tag: tag
        });

    } catch (error) {
        next(error)
    }
})

export const ProjectTagsRouter = router;
