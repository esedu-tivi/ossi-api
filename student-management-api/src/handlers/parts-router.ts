import express from "express";
import { QualificationProject, QualificationProjectPartLinks, QualificationUnitPart, sequelize } from "sequelize-models";
import { beginTransaction, commitTransaction } from "../utils/middleware.js";

const router = express();

router.get("/", beginTransaction, async (req, res, next) => {
    try {
        const parts = await QualificationUnitPart.findAll({
            transaction: res.locals._transaction
        });

        res.json({
            status: 200,
            success: true,
            parts: parts
        });
        
        next();
    } catch (e) {
        next(e)
    }
}, commitTransaction);

router.get("/:id", beginTransaction, async (req, res, next) => {
    try {
        const part = await QualificationUnitPart.findOne({
            where: {
                id: req.params.id
            },
            transaction: res.locals._transaction
        });

        res.json({
            status: 200,
            success: true,
            part: part
        });
        
        next();
    } catch (e) {
        next(e)
    }
}, commitTransaction);

router.get("/:id/projects", beginTransaction, async (req, res, next) => {
    try {
        const projects = await QualificationProject.findAll({
            include: [{
                association: QualificationProject.associations.parts,
                where: {
                    id: req.params.id
                },
            }, {
                association: QualificationProject.associations.tags
            }],
            order: sequelize.literal("\"parts->qualification_projects_parts_relations\".\"part_order_index\" ASC"),
            transaction: res.locals._transaction
        });
        
        res.json(projects);

        next();
    } catch (e) {
        next(e)
    }
}, commitTransaction);

router.get("/:id/parent_qualification_unit", beginTransaction, async (req, res, next) => {
    try {
        const qualificationUnit = await QualificationUnitPart.findByPk(req.params.id, {
            include: [QualificationUnitPart.associations.unit],
            transaction: res.locals._transaction
        });

        res.json(qualificationUnit.unit);
        
        next();
    } catch (e) {
        next(e)
    }
}, commitTransaction);

router.post("/", beginTransaction, async (req, res, next) => {
    try {
        const partFields = req.body;

        // TODO should use transaction 
        const unitOrderIndex = await QualificationUnitPart.count({
            where: { qualificationUnitId: partFields.parentQualificationUnit },
            transaction: res.locals._transaction
        });

        const part = await QualificationUnitPart.create({
            name: partFields.name,
            qualificationUnitId: partFields.parentQualificationUnit,
            description: partFields.description,
            materials: partFields.materials,
            unitOrderIndex: unitOrderIndex
        }, {
            transaction: res.locals._transaction
        });
        
        if (partFields.projectsInOrder != undefined && partFields.projectsInOrder.length > 0) {
            await QualificationProjectPartLinks.bulkCreate(partFields.projectsInOrder.reduce((acc, projectId, index) => [...acc, ({
                qualificationProjectId: projectId,
                qualificationUnitPartId: part.id,
                partOrderIndex: index
            })], []), {
                transaction: res.locals._transaction
            });
        }
        
        res.json({
            status: 200,
            success: true,
            part: part            
        })
        
        next();
    } catch (e) {
        next(e)
    }
}, commitTransaction);

router.put("/:id", beginTransaction, async (req, res, next) => {
    try {
        const updatedPartFields = req.body;

        const updatedPart = await QualificationUnitPart.findByPk(req.params.id, {
            transaction: res.locals._transaction
        });

        if (updatedPart == null) {
            res.json({
                status: 404,
                success: false,
                message: "Part not found."
            });
        }

        await updatedPart.update({
            name: updatedPartFields.name,
            qualificationUnitId: updatedPartFields.parentQualificationUnit,
            description: updatedPartFields.description,
            materials: updatedPartFields.materials,
        }, {
            transaction: res.locals._transaction
        });

        await QualificationProjectPartLinks.destroy({
            where: { qualificationUnitPartId: req.params.id },
            transaction: res.locals._transaction
        });

        await QualificationProjectPartLinks.bulkCreate(updatedPartFields.projectsInOrder.reduce((acc, projectId, index) => [...acc, ({
            qualificationProjectId: projectId,
            qualificationUnitPartId: req.params.id,
            partOrderIndex: index
        })], []), {
            transaction: res.locals._transaction
        });

        await updatedPart.reload({
            transaction: res.locals._transaction
        });

        res.json({
            status: 200,
            success: true,
            part: updatedPart
        });
        
        next();
    } catch (e) {
        next(e)
    }
}, commitTransaction);

export const PartsRouter = router;
