import { Resolver } from "../resolver";

const project: Resolver<{ projectId: number }, null> = async (parent, _, context) => {
    return await context.dataSources.studentManagementAPI.getProject(parent.projectId);
}


export const ProjectUpdateNotification = {
    project
}
