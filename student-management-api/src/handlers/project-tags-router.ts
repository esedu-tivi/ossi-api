import express from "express";
import prisma from "../prisma-client";
import { HttpError } from "../classes/HttpError";

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
        const { tagName } = req.body

        if (!tagName || tagName === '') {
            throw new HttpError(400, `tagName missing or it's empty.`)
        }

        const tag = await prisma.qualificationProjectTag.create({
            data: {
                name: tagName
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
