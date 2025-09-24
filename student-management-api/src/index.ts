import 'dotenv/config';
import app from "./app";
import { MandatoryQualificationUnitsForTitle, Qualification, QualificationCompetenceRequirement, QualificationCompetenceRequirements, QualificationTitle, QualificationUnit } from 'sequelize-models';
import { getExternalQualificationData } from './utils/eperuste';
import { redisPublisher } from './redis.js';
import prisma from './prisma-client';

(async () => {
    // we can presume qualification data from ePeruste is not yet, if there are no units in db

    if (await prisma.qualificationUnit.count() === 0) {
        const qualificationData = await getExternalQualificationData(7861752);

        await prisma.qualification.create({
            data: {
                id: 7861752,
                name: "Tieto- ja viestintätekniikan perustutkinto"
            }
        })

        await prisma.qualificationUnit.createMany({ data: qualificationData.units })
        //await QualificationUnit.bulkCreate(qualificationData.units);
        await prisma.qualificationCompetenceRequirements.createMany({ data: qualificationData.competenceRequirementGroups })
        //await QualificationCompetenceRequirements.bulkCreate(qualificationData.competenceRequirementGroups);
        await prisma.qualificationCompetenceRequirement.createMany({ data: qualificationData.competenceRequirements });
        //await QualificationCompetenceRequirement.bulkCreate(qualificationData.competenceRequirements);
        await prisma.qualificationTitle.createMany({ data: qualificationData.qualificationTitles.map(title => ({ ...title, qualificationId: 7861752 })) });
        //await QualificationTitle.bulkCreate(qualificationData.qualificationTitles.map(title => ({ ...title, qualificationId: 7861752 })));
        await prisma.mandatoryQualificationUnitsForTitle.createMany({ data: qualificationData.mandatoryQualificationTitleUnits });

        //await MandatoryQualificationUnitsForTitle.bulkCreate(qualificationData.mandatoryQualificationTitleUnits);
    }

    redisPublisher.connect();
    app.listen(3000);
})()
