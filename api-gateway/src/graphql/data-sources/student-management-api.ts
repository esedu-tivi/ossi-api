import { type AugmentedRequest, RESTDataSource } from "@apollo/datasource-rest";

class StudentManagementAPI extends RESTDataSource {
    override baseURL = process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL;
    private token: string;

    constructor(options: { token: string; }) {
        super();
        this.token = options.token;
    }

    override willSendRequest(path: string, request: AugmentedRequest) {
        request.headers.authorization = this.token;
    }

    async getTitles() {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/qualification/titles`,
        );
    }

    async getMandatoryUnitsForTitle(id) {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/qualification/titles/${id}/mandatory_units`,
        );
    }
    async getStudents() {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + '/students'
        );
    }
    async getStudent(id) {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/students/${id}`,
        );
    }

    async getTeacher(id) {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/teachers/${id}`,
        )
    }

    async setUpStudent(id, studentSetupData) {
        return this.post(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/students/${id}/student_setup`,
            { body: studentSetupData }
        );
    }

    async getProjects() {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + "/qualification/projects"
        );
    }

    async getProject(id) {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/qualification/projects/${id}`
        );
    }

    async createProject(project) {
        return this.post(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + "/qualification/projects",
            { body: project }
        );
    }

    async updateProject(id, project) {
        return this.put(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/qualification/projects/${id}`,
            { body: project }
        );
    }

    async getProjectIncludedInQualificationUnitParts(id) {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/qualification/projects/${id}/linked_qualification_unit_parts`
        );
    }

    async changeProjectStatus(id, args) {
        return this.put(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/qualification/projects/${id}/change_status`, { body: args }
        )
    }

    async getParts() {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + "/qualification/parts"
        );
    }

    async getPart(id) {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/qualification/parts/${id}`
        );
    }

    async createPart(part) {
        return this.post(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + "/qualification/parts",
            { body: part }
        );
    }

    async updatePart(id, part) {
        return this.put(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/qualification/parts/${id}`,
            { body: part }
        );
    }

    async updatePartOrder(id, partOrder) {
        return this.post(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/qualification/units/${id}/part_order`,
            { body: partOrder }
        );
    }

    async getUnits() {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + "/qualification/units",
        );
    }

    async getProjectTags() {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/qualification/projects/tags`
        );
    }

    async createProjectTag(tag) {
        return this.post(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + "/qualification/projects/tags",
            { body: tag }
        );
    }

    async getPartProjects(id) {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/qualification/parts/${id}/projects`
        );
    }

    async getPartParentQualificationUnit(id) {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/qualification/parts/${id}/parent_qualification_unit`
        );
    }

    async getQualificationUnitCompetenceRequirements(id) {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/qualification/units/${id}/competence_requirements`
        );
    }

    async getQualificationUnitParts(id) {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/qualification/units/${id}/parts`
        );
    }

    async getStudentStudyingQualification(id) {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/students/${id}/studying_qualification`
        );
    }

    async getStudentStudyingQualificationTitle(id) {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/students/${id}/studying_qualification_title`
        );
    }

    async getStudentAssignedQualificationUnits(id) {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/students/${id}/assigned_qualification_units`
        );
    }

    async getStudentAssignedProjects(studentId) {
        const res = await this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/students/${studentId}/assigned_projects`
        );

        return res
    }
    async getStudentSingleAssignedProject(studentId, projectId) {
        const res = await this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/students/${studentId}/single_assigned_project/${projectId}`
        );

        return res
    }

    async assignProjectToStudent(args) {
        return this.post(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/students/assignProjectToStudent`, { body: args }
        );
    }

    async updateStudentProject(args) {
        return this.put(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/students/updateStudentProject`, { body: args }
        );
    }

    async unassignProjectFromStudent(args) {
        return this.delete(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/students/unassignProjectFromStudent/`, { body: args }
        );
    }
    async createWorktimeEntry(args) {
        return this.post(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/students/createWorktimeEntry/`, { body: args }
        );
    }
    async deleteWorktimeEntry(args) {
        return this.delete(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/students/deleteWorktimeEntry/`, { body: args }
        );
    }


}

export { StudentManagementAPI };
