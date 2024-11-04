import axios from "axios"
import { Resolver } from "../resolver.js"

const studyingQualification: Resolver<{ id: number }, null> = async (parent, _, context) => {
    const response = await axios.get(process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/students/${parent.id}/studying_qualification`);

    return response.data;
}

const studyingQualificationTitle: Resolver<{ id: number }, null> = async (parent, _, context) => {
    const response = await axios.get(process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/students/${parent.id}/studying_qualification_title`);

    return response.data;
}

export const Student = {
    studyingQualification,
    studyingQualificationTitle
}
