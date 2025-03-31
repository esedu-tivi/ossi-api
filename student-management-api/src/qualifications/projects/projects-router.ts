import express from "express";
import { Op, Sequelize } from "sequelize";
import { CompetenceRequirementsInProjects, QualificationCompetenceRequirement, QualificationCompetenceRequirements, QualificationProject, QualificationProjectPartLinks, QualificationProjectTag, QualificationProjectTagLinks, QualificationUnitPart, sequelize } from "sequelize-models";

const router = express();

router.get("/tags", async (req, res, next) => {
    try {
        const tags = await QualificationProjectTag.findAll({ transaction: res.locals._transaction });

        res.json(tags);

        next();
    } catch (e) {
        next(e);
    }
});

router.post("/tags", async (req, res, next) => {
    try {
        const tagName = req.body.tagName

        const tag = await QualificationProjectTag.create({
            name: tagName
        }, {
            transaction: res.locals._transaction 
        });

        res.json(tag);
        
        next();
    } catch (e) {
        next(e);
    }
});

router.get("/", async (req, res, next) => {
    try {
        const projects = await QualificationProject.findAll({
            include: [QualificationProject.associations.tags, QualificationProject.associations.competenceRequirements],
            transaction: res.locals._transaction 
        });

        res.json(projects);
        
        next();
    } catch (e) {
        next(e);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const project = await QualificationProject.findOne({
            where: {
                id: req.params.id
            },
            include: [QualificationProject.associations.parts, QualificationProject.associations.tags, QualificationProject.associations.competenceRequirements],
            transaction: res.locals._transaction 
        });

        res.json(project);

        next();
    } catch (e) {
        next(e);
    }
});

router.get("/:id/linked_qualification_unit_parts", async (req, res, next) => {
    try {
        const unitParts = await QualificationUnitPart.findAll({
            include: [{
                association: QualificationUnitPart.associations.projects,
                where: {
                    id: req.params.id
                }
            }],
            transaction: res.locals._transaction 
        });

        res.json(unitParts);
        
        next();
    } catch (e) {
        next(e);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const project = req.body;

        const createdProject = await QualificationProject.create({
            name: project.name,
            description: project.description,
            materials: project.materials,
            duration: project.duration,
            isActive: project.isActive,
        }, {
            transaction: res.locals._transaction 
        });

        for (const partId of project.includedInParts) {
            const part = await QualificationUnitPart.findByPk(partId, {
                include: [QualificationUnitPart.associations.unit],
                transaction: res.locals._transaction 
            });

            if (part === null)
                throw Error("Unknown part id");

            const lastPartOrderIndex = await QualificationProjectPartLinks.count({ 
                where: { qualificationUnitPartId: partId },
                transaction: res.locals._transaction 
            });

            await QualificationProjectPartLinks.create({
                qualificationUnitPartId: partId,
                qualificationProjectId: createdProject.id,
                partOrderIndex: lastPartOrderIndex,
            }, {
                transaction: res.locals._transaction 
            });
        }
        
        await Promise.all(project.tags.map(async tagId => {
            const tag = await QualificationProjectTag.findByPk(tagId, {
                transaction: res.locals._transaction 
            });

            if (tag === null)
                // rollback transaction
                throw Error("Unknown tag id");

            await createdProject.addTag(tag, {
                transaction: res.locals._transaction 
            });
        }));

        await Promise.all(project.competenceRequirements.map(async requirementId => {
            const requirement = await QualificationCompetenceRequirement.findByPk(requirementId, {
                transaction: res.locals._transaction 
            });

            if (requirement === null) 
                throw Error("Unknown requirement id");

            await createdProject.addCompetenceRequirement(requirement, {
                transaction: res.locals._transaction 
            });
        }));

        await createdProject.reload({
            include: [
                { 
                    association: QualificationProject.associations.parts, 
                    through: {
                        attributes: []
                    }
                },
                {
                    association: QualificationProject.associations.tags,
                    through: {
                        attributes: []
                    }
                },
                {
                    association: QualificationProject.associations.competenceRequirements,
                    through: {
                        attributes: []
                    }
                }
            ], 
            transaction: res.locals._transaction 
        });

        res.json(createdProject);
        
        next();
    } catch (e) {
        next(e);
    }
});

router.put("/:id", async (req, res, next) => {
    try {
        const updatedProjectFields = req.body;

        const updatedProject = await QualificationProject.findByPk(req.params.id, {
            include: [QualificationProject.associations.parts, QualificationProject.associations.tags, QualificationProject.associations.competenceRequirements],
            transaction: res.locals._transaction 
        });

        await updatedProject.update({
            name: updatedProjectFields.name,
            description: updatedProjectFields.description,
            materials: updatedProjectFields.materials,
            duration: updatedProjectFields.duration,
            isActive: updatedProjectFields.isActive,
        }, {
            transaction: res.locals._transaction 
        });


        const projectRemovedFromParts = updatedProject.parts.filter(part => !updatedProjectFields.includedInParts.includes(part.id)).map(part => part.id);
        const projectAddedToParts = updatedProjectFields.includedInParts.filter(id => !updatedProject.parts.map(part => part.id).includes(id));

        const projectPartLinks = await QualificationProjectPartLinks.findAll({
            where: { qualificationProjectId: req.params.id },
            transaction: res.locals._transaction 
        });

        await QualificationProjectPartLinks.destroy({
            where: { qualificationUnitPartId: projectRemovedFromParts, qualificationProjectId: req.params.id },
            transaction: res.locals._transaction 
        });

        await Promise.all(projectRemovedFromParts.map(async partId => {
            await QualificationProjectPartLinks.update(
                { partOrderIndex: sequelize.literal("part_order_index - 1") },
                {
                    where: {
                        qualificationUnitPartId: partId,
                        partOrderIndex: { [Op.gt]: projectPartLinks.find(link => link.qualificationUnitPartId == partId).partOrderIndex }
                    },
                    transaction: res.locals._transaction
                }
            );
        }));

        await Promise.all(projectAddedToParts.map(async partId => {
            const lastPartOrderIndex = await QualificationProjectPartLinks.count({
                where: { qualificationUnitPartId: partId },
                transaction: res.locals._transaction
            });

            await QualificationProjectPartLinks.create({
                qualificationUnitPartId: partId,
                qualificationProjectId: updatedProject.id,
                partOrderIndex: lastPartOrderIndex,
            }, {
                transaction: res.locals._transaction
            });
        }));
        
        await QualificationProjectTagLinks.destroy({
            where: { qualificationProjectId: req.params.id }, 
            transaction: res.locals._transaction
        });

        await updatedProject.addTags(updatedProjectFields.tags, {
            transaction: res.locals._transaction
        });

        await CompetenceRequirementsInProjects.destroy({
            where: { projectId: req.params.id },
            transaction: res.locals._transaction
        });

        await updatedProject.addCompetenceRequirements(updatedProjectFields.competenceRequirements, {
            transaction: res.locals._transaction
        });

        await updatedProject.reload({
            include: [
                { 
                    association: QualificationProject.associations.parts, 
                    through: {
                        attributes: []
                    }
                },
                {
                    association: QualificationProject.associations.tags,
                    through: {
                        attributes: []
                    }
                },
                {
                    association: QualificationProject.associations.competenceRequirements,
                    through: {
                        attributes: []
                    }
                }
            ],
            transaction: res.locals._transaction
        });

        res.json(updatedProject);
        
        next();
    } catch (e) {
        next(e);
    }
});

export const ProjectsRouter = router;
