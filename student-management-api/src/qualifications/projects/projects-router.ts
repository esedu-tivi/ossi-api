import express from "express";
import { CompetenceRequirementsInProjects, QualificationCompetenceRequirement, QualificationCompetenceRequirements, QualificationProject, QualificationProjectPartLinks, QualificationProjectTag, QualificationProjectTagLinks, QualificationUnitPart } from "sequelize-models";

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
    });

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
        include: [QualificationProject.associations.parts, QualificationProject.associations.tags, QualificationProject.associations.competenceRequirements]
    });
    
    await updatedProject.update({
        name: updatedProjectFields.name,
        description: updatedProjectFields.description,
        materials: updatedProjectFields.materials,
        duration: updatedProjectFields.duration,
        isActive: updatedProjectFields.isActive,
    });

    await QualificationProjectPartLinks.destroy({ where: { qualificationProjectId: req.params.id } });
    await updatedProject.addParts(updatedProjectFields.includedInParts);
    
    await QualificationProjectTagLinks.destroy({ where: { qualificationProjectId: req.params.id } });
    await updatedProject.addTags(updatedProjectFields.tags);

    await CompetenceRequirementsInProjects.destroy({ where: { projectId: req.params.id } });
    await updatedProject.addCompetenceRequirements(updatedProjectFields.competenceRequirements)

    await updatedProject.reload({
        include: [QualificationProject.associations.parts, QualificationProject.associations.tags, QualificationProject.associations.competenceRequirements]
    });

    res.json(updatedProject);
});

export const ProjectsRouter = router;
