import type { Resolver } from "../resolver.js";

const internships: Resolver<null, { studentId: number }> = async (_, args, context) => {
  return await context.dataSources.studentManagementAPI.getAllStudentInternships(args);
}

const createInternship = async (parent, args, context, info) => {
  return await context.dataSources.studentManagementAPI.createInternship(args)
}

const deleteInternship = async (parentPort, args, context, info) => {
  return await context.dataSources.studentManagementAPI.deleteInternship(args)
}

export const Internship = {
  Query: {
    internships
  },
  Mutation: {
    createInternship,
    deleteInternship
  }
}