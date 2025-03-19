import axios from "axios"

const login = async (parent, args, context, info) => {
    const response = await axios.post(process.env.INTERNAL_AUTH_API_URL + "/login", { idToken: args.idToken });
    
    return response.data;
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

const updatePart = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.updatePart(args.id, args.part);
}

const updatePartOrder = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.updatePartOrder(args.id, { partOrder: args.partOrder });
}

const createProjectTag = async (parent, args, context, info) => {
    return await context.dataSources.studentManagementAPI.createProjectTag({ tagName: args.name });
}

const debugSendNotification = async (parent, args, context, info) => {
    const response = await axios.post(process.env.INTERNAL_NOTIFICATION_SERVER_URL + `/send_notification`, { recipients: args.recipients, notification: JSON.parse(args.notification) });

    return response.status;
}

export const Mutation = {
    login,
    createProject,
    createPart,
    updateProject,
    updatePart,
    updatePartOrder,
    createProjectTag,
    debugSendNotification,
}
