import { type Resolver } from "../resolver.js"

const mandatoryUnits: Resolver<{ id: number }, null> = async (parent, _, context) => {
    return await context.dataSources.studentManagementAPI.getMandatoryUnitsForTitle(parent.id);
}

export const QualificationTitle = {
    mandatoryUnits
};
