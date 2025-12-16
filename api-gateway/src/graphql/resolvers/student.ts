import { type Resolver } from "../resolver.js"

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
    return await context.dataSources.studentManagementAPI.getStudentAssignedProjects(parent.id)
};

const assignedStudentProjects: Resolver<null, { studentId: number }> = async (parent, args, context) => {
    return await context.dataSources.studentManagementAPI.getStudentAssignedProjectsForTeacher(args.studentId)
};

const assignedProjectSingle: Resolver<{ id: number }, { projectId: number }> = async (parent, args, context) => {
    console.log("log ", parent, args)
    if (!args || args.projectId === undefined || args.projectId === null) {
        throw new Error("projectId is required");
    }
    return await context.dataSources.studentManagementAPI.getStudentSingleAssignedProject(parent.id, args.projectId);
};

export const Student = {
    studyingQualification,
    studyingQualificationTitle,
    assignedQualificationUnits,
    assignedProjects,
    assignedProjectSingle,

}

export const StudentResolver = {
    Query: {
        assignedStudentProjects
    }
}
