import axios from "axios"
import { Resolver } from "../resolver.js"

const includedInQualificationUnitParts: Resolver<{ id: number }, null> = async (parent, _, context) => {
    const response = await axios.get(process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/qualification/projects/${parent.id}/linked_qualification_unit_parts`);

    return response.data;
}

export const QualificationProject = {
    includedInQualificationUnitParts,
}
