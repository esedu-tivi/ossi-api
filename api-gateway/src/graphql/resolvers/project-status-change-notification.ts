import { type Resolver } from "../resolver.js";

const project: Resolver<{ projectId: number }, null> = async (parent, _, context) => {
  const projectResponse = await context.dataSources.studentManagementAPI.getProject(parent.projectId);

  return projectResponse.project;
}

export const ProjectStatusChangeNotification = {
  project
}
