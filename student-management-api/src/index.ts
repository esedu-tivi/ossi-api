import 'dotenv/config';
import app from "./app";
import { QualificationUnit } from 'sequelize-models/dist/qualification-unit';
import { QualificationCompetenceRequirement, QualificationCompetenceRequirements } from 'sequelize-models';
import { getExternalQualificationData } from './utils/utils';

(async () => {
    const qualificationData = await getExternalQualificationData(7861752);

    await QualificationUnit.bulkCreate(qualificationData.units);
    await QualificationCompetenceRequirements.bulkCreate(qualificationData.competenceRequirementGroups);
    await QualificationCompetenceRequirement.bulkCreate(qualificationData.competenceRequirements);

    app.listen(3000);
})()
