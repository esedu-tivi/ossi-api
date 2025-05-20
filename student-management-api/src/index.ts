import 'dotenv/config';
import app from "./app";
import { MandatoryQualificationUnitsForTitle, Qualification, QualificationCompetenceRequirement, QualificationCompetenceRequirements, QualificationTitle, QualificationUnit } from 'sequelize-models';
import { getExternalQualificationData } from './utils/eperuste';
import { redisPublisher } from './redis.js';

(async () => {
    // we can presume qualification data from ePeruste is not yet, if there are no units in db
    if ((await QualificationUnit.findAll()).length == 0) {
        const qualificationData = await getExternalQualificationData(7861752);

        await QualificationUnit.bulkCreate(qualificationData.units);
        await QualificationCompetenceRequirements.bulkCreate(qualificationData.competenceRequirementGroups);
        await QualificationCompetenceRequirement.bulkCreate(qualificationData.competenceRequirements);
        await QualificationTitle.bulkCreate(qualificationData.qualificationTitles.map(title => ({ ...title, qualificationId: 7861752 })));
        await MandatoryQualificationUnitsForTitle.bulkCreate(qualificationData.mandatoryQualificationTitleUnits);
    }

    redisPublisher.connect();
    app.listen(3000);
})()
