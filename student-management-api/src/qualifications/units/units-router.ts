import axios from "axios";
import express from "express";
import { QualificationCompetenceRequirement, QualificationCompetenceRequirements } from "sequelize-models";
import { getExternalCompetenceRequirements } from "../../utils/utils";

const router = express();

router.get("/:id/competence_requirements", async (req, res) => {
    const qualificationCompetenceRequirements = await QualificationCompetenceRequirements.findAll({
        where: {
            qualificationUnitId: req.params.id
        },
        include: [QualificationCompetenceRequirements.associations.requirements]
    });
    
    // add requirements to database
    if (qualificationCompetenceRequirements.length == 0) {
        const { qualificationCompetenceRequirementGroupsMapped, qualificationCompetenceRequirementDescriptionsList } = await getExternalCompetenceRequirements(7861752, new Number(req.params.id).valueOf());

        await QualificationCompetenceRequirements.bulkCreate(qualificationCompetenceRequirementGroupsMapped);
        await QualificationCompetenceRequirement.bulkCreate(qualificationCompetenceRequirementDescriptionsList);
        
        return res.json(await QualificationCompetenceRequirements.findAll({
            where: {
                qualificationUnitId: req.params.id
            },
            include: [QualificationCompetenceRequirements.associations.requirements]
        }));
    }
    
    return res.json(qualificationCompetenceRequirements);
});

export const UnitsRouter = router;
