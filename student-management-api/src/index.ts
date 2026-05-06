import 'dotenv/config';
import app from "./app.js";
import { getExternalQualificationData } from './utils/eperuste.js';
import { redisPublisher } from './redis.js';
import prisma from 'prisma-orm';

const main = async () => {
    if (await prisma.qualificationUnit.count() === 0) {
        const qualificationData = await getExternalQualificationData(7861752);

        await prisma.qualification.create({
            data: {
                id: 7861752,
                name: "Tieto- ja viestintätekniikan perustutkinto"
            }
        })

        await prisma.qualificationUnit.createMany({ data: qualificationData.units })
        await prisma.qualificationCompetenceRequirements.createMany({ data: qualificationData.competenceRequirementGroups })
        await prisma.qualificationCompetenceRequirement.createMany({ data: qualificationData.competenceRequirements })
        await prisma.qualificationTitle.createMany({ data: qualificationData.qualificationTitles.map(title => ({ ...title, qualificationId: 7861752 })) })
        await prisma.mandatoryQualificationUnitsForTitle.createMany({ data: qualificationData.mandatoryQualificationTitleUnits })
    }

    redisPublisher.connect();
    app.listen(3000);
}

main()
