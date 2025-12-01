import type { Resolver } from "../resolver.js";

const workplaces: Resolver<null, null> = async (_, __, context) => {
  return await context.dataSources.studentManagementAPI.getAllWorkplaces();
}

const createWorkplace = async (parent, args, context, info) => {
  return await context.dataSources.studentManagementAPI.createWorkplace(args)
}

const editWorkplace = async (parent, args, context, info) => {
  return await context.dataSources.studentManagementAPI.editWorkplace(args)
}

const deleteWorkplace = async (parent, args, context, info) => {
  return await context.dataSources.studentManagementAPI.deleteWorkplace(args)
}

const assignJobSupervisor = async (parent, args, context, info) => {
  return await context.dataSources.studentManagementAPI.assignJobSupervisor(args)
}

const unassignJobSupervisor = async (parent, args, context, info) => {
  return await context.dataSources.studentManagementAPI.unassignJobSupervisor(args)
}

const jobSupervisors: Resolver<null, null> = async (_, __, context) => {
  return await context.dataSources.studentManagementAPI.getAllJobSupervisors()
}

export const Workplace = {
  Query: {
    workplaces,
    jobSupervisors
  },
  Mutation: {
    createWorkplace,
    editWorkplace,
    deleteWorkplace,
    assignJobSupervisor,
    unassignJobSupervisor,
  }
}
