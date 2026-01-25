import express from "express";
import prisma from "prisma-orm";
import { HttpError } from "../classes/HttpError.js";

const router = express();

router.get("/", async (req, res, next) => {
    try {
        const tags = await prisma.qualificationProjectTag.findMany()

        res.json({
            status: 200,
            success: true,
            projectTags: tags
        });

    }
    catch (e) {
        next(e);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { tagName } = req.body

        console.log(req.body)

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

router.post("/many", async (req, res, next) => {
    try {
        const { tagNames } = req.body

        if (!tagNames || !Array.isArray(tagNames)) {
            throw new HttpError(400, `tagNames missing or it's not array.`)
        }

        const filteredTagNames = tagNames.filter(tag => tag !== '').map(tag => ({ name: tag }))

        const createdTags = await prisma.qualificationProjectTag.createManyAndReturn({
            data: filteredTagNames,
            skipDuplicates: true,
            select: {
                id: true,
                name: true
            }
        })

        res.json({
            status: 200,
            success: true,
            projectTags: createdTags
        });

    } catch (error) {
        next(error)
    }
})

export const ProjectTagsRouter = router;
