import axios from "axios"

const login = async (parent, args, context, info) => {
    const response = await axios.post(process.env.INTERNAL_AUTH_API_URL + "/login", { idToken: args.idToken });

    return response.data;
}

const setUpStudent = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.setUpStudent(args.studentId, args.studentSetupInput);
}

const createProject = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.createProject(args.project);
}

const createPart = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.createPart(args.part);
}

const updateProject = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.updateProject(args.id, args.project);
}

const changeProjectStatus = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.changeProjectStatus(args.id, { status: args.status, studentId: args.studentId, teacherComment: args.teacherComment })
}

const updateStudentProject = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.updateStudentProject(args)

}
const updatePart = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.updatePart(args.id, args.part);
}

const updatePartOrder = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.updatePartOrder(args.unitId, { partOrder: args.partOrder });
}

const createProjectTag = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.createProjectTag({ tagName: args.name });
}
const assignProjectToStudent = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.assignProjectToStudent(args)
}
const unassignProjectFromStudent = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.unassignProjectFromStudent(args)
}
const createWorktimeEntry = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.createWorktimeEntry(args)
}
const deleteWorktimeEntry = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.deleteWorktimeEntry(args)
}

const requestMagicLink = async (parent, args, context, info) => {
    const response = await axios.post(
        process.env.INTERNAL_AUTH_API_URL + "/auth/magic-link/request", args
    );
    return response.data;
}

const verifyMagicLink = async (_: unknown, args: { id: string, token: string }) => {
    try {
        const response = await axios.post(
            process.env.INTERNAL_AUTH_API_URL + "/auth/magic-link/verify", args
        );
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.error || "Unknown error";
        throw new Error(message);
    }
};

const markNotificationAsRead = async (parent, args, context, info) => {
    const response = await axios.post(process.env.INTERNAL_NOTIFICATION_SERVER_URL + `/notifications/${args.id}/mark_as_read`, {}, {
        headers: {
            "Authorization": context.token
        }
    });

    return response.data;
}

const debugSendNotification = async (parent, args, context, info) => {
    const response = await axios.post(process.env.INTERNAL_NOTIFICATION_SERVER_URL + `/notifications/send_notification`, { recipients: args.recipients, notification: JSON.parse(args.notification) });

    return response.status;
}

const assignTeachingProject = async (parent, args, context, info) => {
    console.log('assignTeachingProject args:', args)
    return await context.dataSources.studentManagementAPI.assignTeachingProject(args)
}

const unassignTeachingProject = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.unassignTeachingProject(args)
}

const updateTeachingProjectAssigns = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.updateTeachingProjectAssigns(args)
}

const assignStudentGroups = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.assignStudentGroups(args)
}

const unassignStudentGroups = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.unassignStudentGroups(args)
}

const updateStudentGroupAssigns = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.updateStudentGroupAssigns(args)
}

const assignTags = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.assignTags(args)
}

const unassignTags = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.unassignTags(args)
}

const updateTagAssigns = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.updateTagAssigns(args)
}

export const Mutation = {
    login,
    requestMagicLink,
    verifyMagicLink,
    setUpStudent,
    createProject,
    createPart,
    updateProject,
    changeProjectStatus,
    updateStudentProject,
    updatePart,
    updatePartOrder,
    createProjectTag,
    assignProjectToStudent,
    unassignProjectFromStudent,
    createWorktimeEntry,
    deleteWorktimeEntry,
    markNotificationAsRead,
    debugSendNotification,
    assignTeachingProject,
    unassignTeachingProject,
    updateTeachingProjectAssigns,
    assignStudentGroups,
    unassignStudentGroups,
    updateStudentGroupAssigns,
    assignTags,
    unassignTags,
    updateTagAssigns,
}
