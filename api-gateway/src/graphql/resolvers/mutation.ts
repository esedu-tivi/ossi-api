import axios from "axios"

const login = async (parent, args, context, info) => {
    const response = await axios.post(process.env.INTERNAL_AUTH_API_URL + "/login", { idToken: args.idToken });

    return response.data;
}

const createProject = async (parent, args, context, info) => {
    const response = await axios.post(process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + "/qualification/projects", args.project);

    return response.data;
}

const createPart = async (parent, args, context, info) => {
    const response = await axios.post(process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + "/qualification/parts", args.part);

    return response.data;
}

export const Mutation = {
    login,
    createProject,
    createPart,
}
