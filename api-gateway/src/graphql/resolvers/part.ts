import { Resolver } from "../resolver.js"

const projects: Resolver<{ id: number }, null> = async (parent, _, context) => {
    return await context.dataSources.studentManagementAPI.getPartProjects(parent.id);
}

const parentQualificationUnit: Resolver<{ id: number }, null> = async (parent, _, context) => {
    return await context.dataSources.studentManagementAPI.getPartParentQualificationUnit(parent.id);
}

export const QualificationUnitPart = {
    projects,
    parentQualificationUnit,
}
