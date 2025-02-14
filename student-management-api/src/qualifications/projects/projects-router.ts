import express from "express";
import { CompetenceRequirementsInProjects, QualificationCompetenceRequirement, QualificationCompetenceRequirements, QualificationProject, QualificationProjectTag, QualificationProjectTagLinks, QualificationUnitPart } from "sequelize-models";

const router = express();

router.get("/tags", async (req, res) => {
    const tags = await QualificationProjectTag.findAll();

    res.json(tags);
});

router.post("/tags", async (req, res) => {
    const tagName = req.body.tagName

    const tag = await QualificationProjectTag.create({
        name: tagName
    });

    res.json(tag);
});

router.get("/", async (req, res) => {
    const projects = await QualificationProject.findAll({
        include: [QualificationProject.associations.tags, QualificationProject.associations.competenceRequirements]
    });

    res.json(projects);
});

router.get("/:id", async (req, res) => {
    const project = await QualificationProject.findOne({
        where: {
            id: req.params.id
        },
        include: [QualificationProject.associations.tags, QualificationProject.associations.competenceRequirements]
    });

    res.json(project);
});

router.get("/:id/linked_qualification_unit_parts", async (req, res) => {
    const unitParts = await QualificationUnitPart.findAll({
        include: [{
            association: QualificationUnitPart.associations.projects,
            where: {
                id: req.params.id
            }
        }]
    })

    res.json(unitParts);
});

router.post("/", async (req, res) => {
    const project = req.body;
    
    const createdProject = await QualificationProject.create({
        name: project.name,
        description: project.description,
        materials: project.materials,
        duration: project.duration,
        isActive: project.isActive,
    });

    for (const partId of project.includedInParts) {
        const part = await QualificationUnitPart.findByPk(partId, {
            include: [QualificationUnitPart.associations.unit]
        });

        if (part === null)
            throw Error();

        await part.addProject(createdProject);
    }
    
    if (project.tags != undefined && project.tags.length > 0) {
        await Promise.all(project.tags.map(async tagId => {
            const tag = await QualificationProjectTag.findByPk(tagId);

            if (tag === null)
                // rollback transaction
                throw Error();

            await createdProject.addTag(tag)
        }));
    }

    if (project.competenceRequirements != undefined && project.competenceRequirements.length > 0) {
        await Promise.all(project.competenceRequirements.map(async requirementId => {
            const requirement = await QualificationCompetenceRequirement.findByPk(requirementId);

            if (requirement === null) 
                throw Error();

            await createdProject.addCompetenceRequirement(requirement)
        }));
    }

    await createdProject.reload({
        include: [QualificationProject.associations.tags, QualificationProject.associations.competenceRequirements]
    });

    res.json(createdProject);
});

router.put("/:id", async (req, res) => {
    const updatedProjectFields = req.body;

    const updatedProject = await QualificationProject.findByPk(req.params.id, {
        include: [QualificationProject.associations.tags, QualificationProject.associations.competenceRequirements]
    });
    
    await updatedProject.update({
        name: updatedProjectFields.name,
        description: updatedProjectFields.description,
        materials: updatedProjectFields.materials,
        duration: updatedProjectFields.duration,
        isActive: updatedProjectFields.isActive,
    });

    const existingTags = await QualificationProjectTag.findAll({
        include: {
            association: QualificationProjectTag.associations.projects,
            where: {
                id: req.params.id,
            }
        }
    });

    const tagsToRemove = existingTags.filter(tag => !updatedProjectFields.tags.includes(tag.id));
    const tagIdsToAdd = [...new Set(existingTags.filter(tag => updatedProjectFields.tags.includes(tag.id)).map(tag => tag.id).concat(updatedProjectFields.tags))]; 

    await QualificationProjectTagLinks.destroy({
        where: {
            qualificationProjectId: req.params.id,
            qualificationProjectTagId: tagsToRemove.map(tag => tag.id)
        }
    });

    await QualificationProjectTagLinks.bulkCreate(tagIdsToAdd.map(tagId => ({
        qualificationProjectTagId: tagId,
        qualificationProjectId: Number(req.params.id)
    })));

    const requirementsToRemove = updatedProject.competenceRequirements.filter(requirement => !updatedProjectFields.competenceRequirements.includes(requirement.id));
    const requirementIdsToAdd = [...new Set(updatedProject.competenceRequirements.filter(requirement => updatedProjectFields.competenceRequirements.includes(requirement.id)).map(tag => tag.id).concat(updatedProjectFields.competenceRequirements))]

    await CompetenceRequirementsInProjects.destroy({
        where: {
            competenceRequirementId: requirementsToRemove.map(requirement => requirement.id),
            projectId: req.params.id
        }
    });

    await CompetenceRequirementsInProjects.bulkCreate(requirementIdsToAdd.map(requirementId => ({
        competenceRequirementId: requirementId,
        projectId: Number(req.params.id)
    })));

    await updatedProject.reload();

    res.json(updatedProject);
});

export const ProjectsRouter = router;
