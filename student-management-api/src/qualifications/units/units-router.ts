import axios from "axios";
import express from "express";
import { QualificationCompetenceRequirement, QualificationCompetenceRequirements } from "sequelize-models";

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
        const response = await axios.get(`https://virkailija.opintopolku.fi/eperusteet-service/api/external/peruste/7861752/tutkinnonOsat/${req.params.id}`)
        
        const qualificationCompetenceRequirementGroupsMapped = response
            .data["ammattitaitovaatimukset2019"]["kohdealueet"]
            .map(group => ({
                id: group["kuvaus"]["_id"],
                qualificationUnitId: req.params.id,
                title: group["kuvaus"]["fi"],
            })
        );

        const qualificationCompetenceRequirementDescriptionsList = response
            .data["ammattitaitovaatimukset2019"]["kohdealueet"]
            .reduce((list, group) => {
                const requirements = group["vaatimukset"].map(requirement => ({
                    id: requirement["koodi"]["id"],
                    groupId: group["kuvaus"]["_id"],
                    description: requirement["vaatimus"]["fi"]
                }))

                return [...list, ...requirements];
            }, []
        );

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
