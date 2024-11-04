import axios from "axios"

const login = async (parent, args, context, info) => {
    const response = await axios.post(process.env.INTERNAL_AUTH_API_URL + "/login", args.id_token);

    return response.data;
}

export const Mutation = {
    login
}
