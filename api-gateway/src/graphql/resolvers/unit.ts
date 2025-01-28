import axios from "axios"
import { Resolver } from "../resolver.js"

const competenceRequirementGroups: Resolver<{ id: number }, null> = async (parent, _, context) => {
    return await context.dataSources.studentManagementAPI.getQualificationUnitCompetenceRequirements(parent.id);
}

export const QualificationUnit = {
    competenceRequirementGroups,
}
