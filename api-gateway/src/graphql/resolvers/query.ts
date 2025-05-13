import axios from "axios"
import { Resolver } from "../resolver.js"

const me: Resolver<null, null> = async (_, __, context) => {
    if (context.user.type == "STUDENT") {
        const response = await context.dataSources.studentManagementAPI.getStudent(context.user.id);
        return { ...response, user: response.student };
    } else if (context.user.type == "TEACHER") {
        const response = await context.dataSources.studentManagementAPI.getTeacher(context.user.id);
        return { ...response, user: response.teacher };
    }

    throw Error();
}

const amISetUp: Resolver<null, null> = async (_, __, context) => {
    return {
        status: 200,
        success: true,
        amISetUp: context.user.isSetUp
    };
}

const students: Resolver<null, null> = async (parent, _, context) => { 
	const data = await context.dataSources.studentManagementAPI.getStudents();
		// stopgap filter to discard status and success elements from object
	console.log('students', data);
	return data.students;

	const response = await axios.get(
		process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + '/students'
	);
    return response.data;
}

const titles: Resolver<null, null> = async (parent, _, context) => { 
    return await context.dataSources.studentManagementAPI.getTitles();
}

const units: Resolver<null, null> = async (_, __, context) => {
    return await context.dataSources.studentManagementAPI.getUnits();
}

const parts: Resolver<null, null> = async (_, __, context) => {
	const data = await context.dataSources.studentManagementAPI.getParts();
	// stopgap filter to discard status and success elements from object
	return data.parts;
    return await context.dataSources.studentManagementAPI.getParts();
}

const projects: Resolver<null, null> = async (_, __, context) => {
	const data = await context.dataSources.studentManagementAPI.getProjects();
	// stopgap filter to discard status and success elements from object
	return data.projects;
    return await context.dataSources.studentManagementAPI.getProjects();
}

const part: Resolver<null, { id: number }> = async (_, args, context) => {
	const data= await context.dataSources.studentManagementAPI.getPart(args.id);
	// stopgap filter to discard status and success elements from object
    return data.part
};

const project: Resolver<null, { id: number }> = async (_, args, context) => {
    return await context.dataSources.studentManagementAPI.getProject(args.id);
}

const projectTags: Resolver<null, null> = async (_, args, context) => {
    return await context.dataSources.studentManagementAPI.getProjectTags();
}

const notifications: Resolver<null, null> = async (_, args, context) => {
	const response = await axios.get(
		process.env.INTERNAL_NOTIFICATION_SERVER_URL + `/get_notifications`,
		{
        headers: {
            "Authorization": context.token
        }
    });
 
    return response.data;
}

const notification: Resolver<null, { id: number }> = async (_, args, context) => {
    const response = await axios.get(process.env.INTERNAL_NOTIFICATION_SERVER_URL + `/notification/${args.id}`, {
        headers: {
            "Authorization": context.token
        }
    });
 
    return response.data;
}

const unreadNotificationCount: Resolver<null, null> = async (_, args, context) => {
    const response = await axios.get(process.env.INTERNAL_NOTIFICATION_SERVER_URL + `/get_unread_notification_count`, {
        headers: {
            "Authorization": context.token
        }
    });
 
    return response.data;
}

export const Query = {
    me,
    amISetUp,
    students,
    units,
    titles,
    parts,
    projects,
    part,
    project,
    projectTags,
    notifications,
    notification,
    unreadNotificationCount
}
