import axios from "axios"
import { Resolver } from "../resolver.js"

const students: Resolver<null, null> = async (parent, _, context) => {
    if (false) { //(!context.user || context.userScope != "TEACHER" || context.userScope != "ADMIN") {
        throw Error()
    }
    
    const response = await axios.get(process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + "/students");

    return response.data;
}

const parts: Resolver<null, null> = async (_, __, context) => {
    return await context.dataSources.studentManagementAPI.getParts();
}

const projects: Resolver<null, null> = async (_, __, context) => {
    return await context.dataSources.studentManagementAPI.getProjects();
}

const part: Resolver<null, { id: number }> = async (_, args, context) => {
    return await context.dataSources.studentManagementAPI.getPart(args.id);
}

const project: Resolver<null, { id: number }> = async (_, args, context) => {
    return await context.dataSources.studentManagementAPI.getProject(args.id);
}

const projectTags: Resolver<null, null> = async (_, args, context) => {
    return await context.dataSources.studentManagementAPI.getProjectTags();
}

const notifications: Resolver<null, null> = async (_, args, context) => {
    const response = await axios.get(process.env.INTERNAL_NOTIFICATION_SERVER_URL + `/get_notifications`, {
        headers: {
            "Authorization": context.user.oid
        }
    });
 
    return response.data;
}

export const Query = {
    students,
    parts,
    projects,
    part,
    project,
    projectTags,
    notifications,
}
