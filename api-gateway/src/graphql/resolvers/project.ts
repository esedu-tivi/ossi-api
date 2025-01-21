import axios from "axios"
import { Resolver } from "../resolver.js"

const includedInQualificationUnitParts: Resolver<{ id: number }, null> = async (parent, _, context) => {
    return await context.dataSources.studentManagementAPI.getProjectIncludedInQualificationUnitParts(parent.id);
}

export const QualificationProject = {
    includedInQualificationUnitParts,
}
