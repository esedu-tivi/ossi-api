import type { Resolver } from "../resolver.js";

const workplaces: Resolver<null, null> = async (_, __, context) => {
  return await context.dataSources.studentManagementAPI.getAllWorkplaces();
}

const workplace: Resolver<null, { id: string }> = async (_, args, context) => {
  return await context.dataSources.studentManagementAPI.getSingleWorkplace(args.id);
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

const jobSupervisor: Resolver<null, { jobSupervisorId: string }> = async (_, args, context) => {
  return await context.dataSources.studentManagementAPI.getJobSupervisor(args.jobSupervisorId)
}

const jobSupervisorsByWorkplace: Resolver<null, null> = async (_, args, context) => {
  return await context.dataSources.studentManagementAPI.getJobSupervisorsByWorkplace(args)
}

const updateJobSupervisorAssigns = async (parent, args, context, info) => {
  return await context.dataSources.studentManagementAPI.updateJobSupervisorAssigns(args)
}

const createJobSupervisor = async (parent, args, context, info) => {
  return await context.dataSources.studentManagementAPI.createJobSupervisor(args)
}

const deleteJobSupervisor = async (parent, args, context, info) => {
  return await context.dataSources.studentManagementAPI.deleteJobSupervisor(args)
}

const editJobSupervisor = async (parent, args, context, info) => {
  return await context.dataSources.studentManagementAPI.editJobSupervisor(args)
}

export const Workplace = {
  Query: {
    workplaces,
    workplace,
    jobSupervisors,
    jobSupervisorsByWorkplace,
    jobSupervisor,
  },
  Mutation: {
    createWorkplace,
    editWorkplace,
    deleteWorkplace,
    assignJobSupervisor,
    unassignJobSupervisor,
    updateJobSupervisorAssigns,
    createJobSupervisor,
    deleteJobSupervisor,
    editJobSupervisor,
  }
}
