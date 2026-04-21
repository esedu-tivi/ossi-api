import type { Resolver } from "../resolver.js";

const internships: Resolver<null, { studentId: number }> = async (_, args, context) => {
  return await context.dataSources.studentManagementAPI.getAllStudentInternships(args);
}

const myInternships: Resolver<null, null> = async (_, __, context) => {
  if (!context.user) {
    throw new Error("Unauthorized")
  }

  return await context.dataSources.studentManagementAPI.getAllStudentInternships({ studentId: context.user.id });
}

const createInternship = async (parent, args, context, info) => {
  return await context.dataSources.studentManagementAPI.createInternship(args)
}

const deleteInternship = async (parent, args, context, info) => {
  return await context.dataSources.studentManagementAPI.deleteInternship(args)
}

const editInternship = async (parent, args, context, info) => {
  return await context.dataSources.studentManagementAPI.editInternship(args)
}

export const Internship = {
  Query: {
    internships,
    myInternships
  },
  Mutation: {
    createInternship,
    deleteInternship,
    editInternship
  }
}