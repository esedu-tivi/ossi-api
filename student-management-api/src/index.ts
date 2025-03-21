import 'dotenv/config';
import app from "./app";
import { QualificationUnit } from 'sequelize-models/dist/qualification-unit';
import { QualificationCompetenceRequirement, QualificationCompetenceRequirements } from 'sequelize-models';
import { getExternalQualificationData } from './utils/eperuste';

(async () => {
    // we can presume qualification data from ePeruste is not yet, if there are no units in db
    if ((await QualificationUnit.findAll()).length == 0) {
        const qualificationData = await getExternalQualificationData(7861752);

        await QualificationUnit.bulkCreate(qualificationData.units);
        await QualificationCompetenceRequirements.bulkCreate(qualificationData.competenceRequirementGroups);
        await QualificationCompetenceRequirement.bulkCreate(qualificationData.competenceRequirements);
    }

    app.listen(3000);
})()
