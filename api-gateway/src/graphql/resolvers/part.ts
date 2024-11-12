import axios from "axios"
import { Resolver } from "../resolver.js"

const projects: Resolver<{ id: number }, null> = async (parent, _, context) => {
    const response = await axios.get(process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/qualification/parts/${parent.id}/projects`);

    return response.data;
}

export const QualificationPart = {
    projects,
}
