import axios from "axios"
import { Resolver } from "../resolver.js"

const students: Resolver<null, null> = async (parent, _, context) => {
    if (false) { //(!context.user || context.userScope != "TEACHER" || context.userScope != "ADMIN") {
        throw Error()
    }
    
    const response = await axios.get(process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + "/students");

    return response.data;

//    const response = await pool.query("SELECT u.id, u.first_name as \"firstName\", u.last_name as \"lastName\", u.email, u.phone_number as \"phoneNumber\", u.archived, s.group_id as \"groupId\" FROM users AS u INNER JOIN students AS s ON u.id = s.user_id")

 //   return response.rows
}

const parts: Resolver<null, null> = async (_, __, context) => {
    const response = await axios.get(process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + "/qualification/parts");

    return response.data;
}

const projects: Resolver<null, null> = async (_, __, context) => {
    const response = await axios.get(process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + "/qualification/projects");

    return response.data;
}

export const Query = {
    students,
    parts,
    projects,
}
