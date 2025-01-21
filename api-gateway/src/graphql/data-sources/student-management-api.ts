import { AugmentedRequest, RESTDataSource } from "@apollo/datasource-rest";

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
            project
        );
    }

    async updateProject(project) {
        return this.put(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + "/qualification/projects",
            project
        );
    }

    async getProjectIncludedInQualificationUnitParts(id) {
        return this.get(
            process.env.INTERNAL_STUDENT_MANAGEMENT_API_URL + `/qualification/projects/${id}/linked_qualification_unit_parts`
        );
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
            part
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
            tag
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
}

export { StudentManagementAPI };
