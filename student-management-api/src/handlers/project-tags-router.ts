import express from "express";
import { QualificationProjectTag } from "sequelize-models";
import { beginTransaction, commitTransaction } from "../utils/middleware";

const router = express();

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

export const ProjectTagsRouter = router;
