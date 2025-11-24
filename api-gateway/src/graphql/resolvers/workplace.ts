import type { Resolver } from "../resolver.js";

const workplaces: Resolver<null, null> = async (_, __, context) => {
  return await context.dataSources.studentManagementAPI.getAllWorkplaces();
}

const createWorkplace = async (parent, args, context, info) => {
  return await context.dataSources.studentManagementAPI.createWorkplace(args)
}

const editWorkplace = async (parent, args, context, info) => {
  console.log(args)
  return await context.dataSources.studentManagementAPI.editWorkplace(args)
}

export const Workplace = {
  Query: {
    workplaces
  },
  Mutation: {
    createWorkplace,
    editWorkplace
  }

}
