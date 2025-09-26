import express from "express";
//import { QualificationProjectTag } from "sequelize-models";
//import { beginTransaction, commitTransaction } from "../utils/middleware";
import prisma from "../prisma-client";

const router = express();

/*
router.get("/", beginTransaction, async (req, res, next) => {
    try {
        const tags = await QualificationProjectTag.findAll({ transaction: res.locals._transaction });

        res.json({
            status: 200,
            success: true,
            tags: tags
        });

        next();
    } catch (e) {
        next(e);
    }
}, commitTransaction); 

*/

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

/*
router.post("/", beginTransaction, async (req, res, next) => {
    try {
        const tagName = req.body.tagName

        const tag = await QualificationProjectTag.create({
            name: tagName
        }, {
            transaction: res.locals._transaction
        });

        res.json({
            status: 200,
            success: true,
            tag: tag
        });

        next();
    } catch (e) {
        next(e);
    }
}, commitTransaction);
 */

router.post("/", async (req, res, next) => {
    try {
        const { tagName } = req.body

        if (!tagName || tagName === '') {
            return res.json({
                status: 400,
                success: true,
                message: `tagName missing or it's empty.`
            })
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
        next(error);
    }
});

export const ProjectTagsRouter = router;
