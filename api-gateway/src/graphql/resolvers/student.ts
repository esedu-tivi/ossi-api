import axios from "axios"
import { Resolver } from "../resolver.js"

const studyingQualification: Resolver<{ id: number }, null> = async (parent, _, context) => {
    return await context.dataSources.studentManagementAPI.getStudentStudyingQualification(parent.id);
}

const studyingQualificationTitle: Resolver<{ id: number }, null> = async (parent, _, context) => {
    return await context.dataSources.studentManagementAPI.getStudentStudyingQualificationTitle(parent.id);
}

const assignedQualificationUnits: Resolver<{ id: number }, null> = async (parent, _, context) => {
    return await context.dataSources.studentManagementAPI.getStudentAssignedQualificationUnits(parent.id);
}

const assignedProjects: Resolver<{ id: number }, null> = async (parent, args, context) => {
    console.log("requesting assigned projects", parent.id,)
    return await context.dataSources.studentManagementAPI.getStudentAssignedProjects(parent.id);
};

export const Student = {
    studyingQualification,
    studyingQualificationTitle,
    assignedQualificationUnits,
    assignedProjects,
}
