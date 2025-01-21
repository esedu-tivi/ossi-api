import axios from "axios"
import { Resolver } from "../resolver.js"

const studyingQualification: Resolver<{ id: number }, null> = async (parent, _, context) => {
    return await context.dataSources.studentManagementAPI.getStudentStudyingQualification(parent.id);
}

const studyingQualificationTitle: Resolver<{ id: number }, null> = async (parent, _, context) => {
    return await context.dataSources.studentManagementAPI.getStudentStudyingQualificationTitle(parent.id);
}

export const Student = {
    studyingQualification,
    studyingQualificationTitle
}
