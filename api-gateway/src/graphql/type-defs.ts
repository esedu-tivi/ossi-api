const newLocal = `#graphql
    scalar DateTime

    directive @authenticated on FIELD_DEFINITION
    directive @authenticatedAsTeacher on FIELD_DEFINITION
    directive @authenticatedAsStudent on FIELD_DEFINITION


    # --- Enums ---
    
    enum AuthorityScope {
        STUDENT
        TEACHER
        JOB_SUPERVISOR
        ADMIN
    }

    enum UserType {
        STUDENT
        TEACHER
        JOB_SUPERVISOR
    }
    enum ProjectStatus {
        WORKING
        RETURNED
        ACCEPTED
        REJECTED
    }

    enum QualificationCompletion {
        FULL_COMPLETION
        PARTIAL_COMPLETION
    }


    # --- Types ---

    type AuthResponse {
        token: String!
    }
    
    # should use status wrapper type for responses
    type Empty {
        status: String!
    }

    type LocalizedString {
        fi: String
        en: String
        sv: String
    }

    type QualificationTitle {
        id: Int
        name: String
        mandatoryUnits: [QualificationUnit!]!
    }

    type Qualification {
        id: Int!
        name: String
        #QualificationUnits: [QualificationUnit!]!
    }

    type VocationalCompetenceRequirementDescription {
        id: Int!
        # should use LocalizedString
        description: String!
    }

    type VocationalCompetenceRequirementGroup {
        id: Int!
        title: String!
        requirements: [VocationalCompetenceRequirementDescription!]!
    }

    type QualificationUnit {
        id: Int!
        name: String!
        competenceRequirementGroups: [VocationalCompetenceRequirementGroup!]!
        parts: [QualificationUnitPart!]!
    }

    type QualificationUnitForInternship {
        id: Int
        name: String
    }

    type QualificationUnitPart {
        id: Int!
        name: String!
        description: String!
        materials: String!
        projects: [QualificationProject!]!
        parentQualificationUnit: QualificationUnit!
    }

    type QualificationProjectTag {
        id: Int!
        name: String!
    }

    type QualificationProject {
        id: ID!
        name: String!
        description: String!
        duration: String!
        materials: String!
        isActive: Boolean!
        includedInQualificationUnitParts: [QualificationUnitPart!]!
        competenceRequirements: [VocationalCompetenceRequirementDescription!]!
        tags: [QualificationProjectTag!]!
    }

    type WorktimeEntry{
        startDate: DateTime
        endDate: DateTime
        description: String
        id:ID
    }

    type AssignedProjects {
        projectId: ID
        projectStatus: ProjectStatus
        startDate: DateTime
        deadlineDate: DateTime
        projectPlan: String
        projectReport: String
        teacherComment: String
        parentProject: QualificationProject
        worktimeEntries: [WorktimeEntry!]
    }

    type AssignedProject {
        projectId: ID
        projectStatus: ProjectStatus
        startDate: DateTime
        deadlineDate: DateTime
        projectPlan: String
        projectReport: String
        teacherComment: String
        parentProject: QualificationProject
        worktimeEntries: [WorktimeEntry!]
    }

    interface User { 
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
        archived: Boolean!
    }

    type Student implements User {
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
        archived: Boolean!
        groupId: String!
        qualificationCompletion: QualificationCompletion
        studyingQualification: Qualification
        studyingQualificationTitle: QualificationTitle
        assignedQualificationUnits: [QualificationUnit!]
        assignedProjects: [AssignedProjects!]
        assignedProjectSingle(projectId:ID!): AssignedProjectSingleResponse!
    }

    type StudentForInternship {
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
    }

    type Teacher implements User {
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
        archived: Boolean!
        teachingQualification: Qualification
        teachingQualificationTitle: QualificationTitle
    }

    type TeacherForInternship {
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
    }

    type ProjectReturnNotification {
        id: ID!
        project: QualificationProject!
        projectSubmitterStudentId: ID!
        hasBeenRead: Boolean!
        time: DateTime!
    }

    type ProjectUpdateNotification {
        id: ID! 
        project: QualificationProject!
        updateMessage: String!
        hasBeenRead: Boolean!
        time: DateTime!
    }

    type ProjectStatusChangeNotification {
        id: ID! 
        project: QualificationProject!
        message: String!
        status: ProjectStatus!
        teacherComment: String
        hasBeenRead: Boolean!
        time: DateTime!
    }

    type Subscription {
        messageReceived(conversationId: ID!): Message!
        conversationUpdated(userId: ID!): Conversation!
    }

    type Message {
        id: ID!
        conversationId: ID!
        sender: User!
        content: String!
        readBy: [User!]!
        createdAt: String!
    }

    type Conversation {
        id: ID!
        participants: [User!]!
        lastMessage: Message
        createdAt: String!
    }

    type Workplace {
        id: ID!
        name: String!
    }

    type WorkplaceWithJobSupervisor {
        id: ID!
        name: String!
        jobSupervisors: [JobSupervisorWithoutWorkplace]!
    }

    type InternshipForWorkplace {
        id: ID!
        startDate: DateTime!
        endDate: DateTime!
        info: String
        student: StudentForInternship! 
        jobSupervisor: JobSupervisorWithoutWorkplace!
        teacher: TeacherForInternship!
    }

    type WorkplaceWithInternships {
        id: ID!
        name: String!
        jobSupervisors: [JobSupervisorWithoutWorkplace!]
        internships: [InternshipForWorkplace!]
    }

    type WorkplaceForInternship {
        id: ID!
        name: String!
        jobSupervisor: JobSupervisorWithoutWorkplace
    }

    type Internship {
        id: ID!
        startDate: DateTime
        endDate: DateTime
        info: String
        teacher: TeacherForInternship
        workplace: WorkplaceForInternship
        qualificationUnit: QualificationUnitForInternship
    }

    type InternshipForJobSupervisor {
        id: ID!
        startDate: DateTime!
        endDate: DateTime!
        info: String
        teacher: TeacherForInternship!
        student: StudentForInternship!
        qualificationUnit: QualificationUnitForInternship
    }

    type WorkplaceForJobSupervisor {
        id: ID!
        name: String!
        internships: [InternshipForWorkplace!]
    }

    type JobSupervisor implements User {
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
        phoneNumber: String
        archived: Boolean!
        workplace: Workplace
        internships: [InternshipForJobSupervisor!]
    }

    type JobSupervisorWithoutWorkplace {
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
        phoneNumber: String
    }

    type StudentGroup {
        id: ID!
        groupId: String!
    }

    #--- End of Types ---


    # --- Unions ---

    union Notification = ProjectReturnNotification | ProjectUpdateNotification | ProjectStatusChangeNotification

    #--- End of Unions


    # --- Responses ---

    type NotificationsResponse {
        success: Boolean!
        status: Int!
        message: String
        notifications: [Notification!]
    }

    type NotificationResponse {
        success: Boolean!
        status: Int!
        message: String
        notification: Notification
    }

    type UnreadNotificationCountResponse {
        success: Boolean!
        status: Int!
        message: String
        count: Int
    }

    type MeResponse {
        success: Boolean!
        status: Int!
        message: String
        user: User
    }

    type AmISetUpResponse {
        success: Boolean!
        status: Int!
        message: String
        amISetUp: Boolean!
    }
    
    type StudentsResponse {
        success: Boolean!
        status: Int!
        message: String
        students: [Student!]
    }

    type StudentResponse {
        success: Boolean!
        status: Int!
        student: Student
    }
    
    type TitlesResponse {
        success: Boolean!
        status: Int!
        message: String
        titles: [QualificationTitle!]
    }
    
    type UnitsResponse {
        success: Boolean!
        status: Int!
        message: String
        units: [QualificationUnit!]
    }
    
    type PartsResponse {
        success: Boolean!
        status: Int!
        message: String
        parts: [QualificationUnitPart!]
    }
    
    type PartResponse {
        success: Boolean!
        status: Int!
        message: String
        part: QualificationUnitPart
    }

    type ProjectResponse {
        success: Boolean!
        status: Int!
        message: String
        project: QualificationProject
    }

    type ProjectsResponse {
        success: Boolean!
        status: Int!
        message: String
        projects: [QualificationProject!]
    }
    
    type ProjectTagsResponse {
        success: Boolean!
        status: Int!
        message: String
        projectTags: [QualificationProjectTag!]
    }

    type StudentAssignResponse {
        success: Boolean!
        status: Int!
        message: String
    }

    type StudentProjectUpdateResponse {
        success: Boolean!
        status: Int!
        message: String
    }

    type StudentUnassignProjectResponse {
        success: Boolean!
        status: Int!
        message: String
    }

    type LoginResponse {
        status: Int!
        success: Boolean!
        message: String
        token: String
    }



    type MagicLinkRequestResponse {
        ok: Boolean!
    }

    type MagicLinkVerifyResponse {
        ok: Boolean!
        jwt: String
        message: String
    }

    type SetUpStudentResponse {
        status: Int!
        success: Boolean!
        message: String
    }

    type CreatePartResponse {
        status: Int!
        success: Boolean!
        message: String
        part: QualificationUnitPart
    }

    type CreateProjectResponse {
        status: Int!
        success: Boolean!
        message: String
        project: QualificationProject
    }

    type UpdatePartResponse {
        status: Int!
        success: Boolean!
        message: String
        part: QualificationUnitPart
    }

    type UpdateProjectResponse {
        status: Int!
        success: Boolean!
        message: String
        project: QualificationProject
    }

    type ChangeProjectStatusResponse {
        status: Int!
        success: Boolean!
        message: String,
    }

    type UpdatePartOrderResponse {
        status: Int!
        success: Boolean!
        message: String
    }

    type CreateProjectTagResponse {
        status: Int!
        success: Boolean!
        message: String
        tag: QualificationProjectTag
    }

    # update WIP
    type ProjectUpdateResponse {
        status: Int!
        success: Boolean!
        message: String
    }

    type MarkNotificationAsReadResponse {
        status: Int!
        success: Boolean!
        message: String
    }

    type GenericResponse {
        success: Boolean!
        status: Int!
        message: String
    }

    type WorktimeEntryResponse {
        success: Boolean!
        status: Int!
        message: String!,
        entry: WorktimeEntry!
    }

    type AssignedProjectSingleResponse { 
        success: Boolean!
        status: Int!
        message: String,
        project(projectId:ID!): AssignedProject
    }

    type UpdateAssignedProjectResponse {
        success: Boolean!
        status:Int!
        project: AssignedProject
    }

    type AssignTeachingProjectResponse {
        success: Boolean!
        status: Int!
        message: String
    }

    type UnassignTeachingProjectResponse {
        success: Boolean!
        status: Int!
        message: String
    }

    type UpdateTeachingProjectsResponse {
        success: Boolean!
        status: Int!
        message: String
    }

    type UpdateTeachingProjectAssignsResponse {
        success: Boolean!
        status: Int!
        message: String
    }

    type AssignedStudentGroupsResponse {
        success: Boolean!
        status: Int!
        studentGroups: [StudentGroup]!
    }

    type AssignStudentGroupsResponse {
        success: Boolean!
        status: Int!
        message: String
    }

    type UnassignStudentGroupsResponse {
        success: Boolean!
        status: Int!
        message: String
    }

    type UpdateStudentGroupAssignsResponse {
        success: Boolean!
        status: Int!
        message: String
    }

    type AssignedTagsResponse {
        success: Boolean!
        status: Int!
        tags: [QualificationProjectTag]!
    }

    type AssignTagsResponse {
        success: Boolean!
        status: Int!
        message: String
    }

    type UnassignTagsResponse {
        success: Boolean!
        status: Int!
        message: String
    }

    type UpdateTagAssignsResponse {
        success: Boolean!
        status: Int!
        message: String
    }

    type WorkplacesResponse {
        success: Boolean!
        status: Int!
        workplaces: [WorkplaceWithJobSupervisor]!
    }

    type WorkplaceResponse {
        success: Boolean!
        status: Int!
        workplace: WorkplaceWithInternships!
    }

    type CreateWorkplaceResponse {
        success: Boolean!
        status: Int!
        workplace: WorkplaceWithJobSupervisor!
    }

    type EditWorkplaceResponse {
        success: Boolean!
        status: Int!
        editedWorkplace: WorkplaceWithJobSupervisor!
    }

    type DeleteWorkplaceResponse {
        success: Boolean!
        status: Int!
    }

    type InternshipsResponse {
        success: Boolean!
        status: Int!
        internships: [Internship]!
    }

    type CreateInternshipResponse {
        success: Boolean!
        status: Int!
        internship: Internship!
    }

    type DeleteInternshipResponse {
        success: Boolean!
        status: Int!
    }

    type EditInternshipResponse {
        success: Boolean!
        status: Int!
        editedInternship: Internship!
    }

    type AssignJobSupervisorResponse {
        success: Boolean!
        status: Int!
    }

    type UnassignJobSupervisorResponse {
        success: Boolean!
        status: Int!
    }

    type JobSupervisorsResponse {
        success: Boolean!
        status: Int!
        jobSupervisors: [JobSupervisor]!
    }

    type JobSupervisorResponse {
        success: Boolean!
        status: Int!
        jobSupervisor: JobSupervisor!
    }

    type JobSupervisorsWithWorkplaceResponse {
        success: Boolean!
        status: Int!
        jobSupervisors: [JobSupervisorWithoutWorkplace]!
    }

    type UpdateJobSupervisorAssignsResponse {
        success: Boolean!
        status: Int!
        message: String!
    }

    type AssignedProjectsResponse {
        success: Boolean!
        status: Int!
        assignedProjects: [AssignedProject]!
    }

    type CreateJobSupervisorResponse {
        success: Boolean!
        status: Int!
        createdJobSupervisor: JobSupervisorWithoutWorkplace
    }

    type deleteJobSupervisorResponse {
        success: Boolean!
        status: Int!
    }

    type EditJobSupervisorResponse {
        success: Boolean!
        status: Int!
    }

    type AssignedTeachingProjectsResponse {
        success: Boolean!
        status: Int!
        assignedProjects: [QualificationProject]!
    }

    # --- End of Responses


    # --- Inputs ---

    input CreateProjectInput {
        name: String!
        description: String!
        materials: String!
        duration: Int!
        includedInParts: [ID!]!
        competenceRequirements: [ID!]!
        tags: [ID!]!
        isActive: Boolean!
    }

    input UpdateProjectInput {
        name: String
        description: String
        materials: String
        duration: Int
        includedInParts: [ID!]
        competenceRequirements: [ID!]
        tags: [ID!]
        isActive: Boolean
        notifyStudents: Boolean
    }

    input CreatePartInput {
        name: String!
        description: String!
        materials: String!
        projectsInOrder: [ID!]
        parentQualificationUnit: ID!
    }

    input StudentSetupInput {
        qualificationId: ID!
        qualificationCompletion: QualificationCompletion!
    }

    input AssignProject {
        student: ID!
        project: ID!
    }
    # update WIP
    input UpdateStudentProjectInput {
        projectStatus: ProjectStatus
        startDate: DateTime
        deadlineDate: DateTime
        projectPlan: String
        projectReport: String
        teacherComment: String
    }

    input StudentWorktimeInput {
        startDate: DateTime!
        endDate: DateTime!
        description: String
    }

    input InternshipInput {
        startDate: DateTime
        endDate: DateTime
        info: String
        jobSupervisorId: ID
        studentId: ID!
        teacherId: ID
        workplaceId: ID!
        qualificationUnitId: ID
    }

    input JobSupervisorInput {
        firstName: String!
        lastName: String!
        email: String!
        phoneNumber: String
    }

    # --- End of Inputs ---



    # --- Query & Mutation ---

    type Query {
        me: MeResponse! @authenticated
        amISetUp: AmISetUpResponse! @authenticated
        students: StudentsResponse! @authenticatedAsTeacher
        student(id: ID!): StudentResponse! @authenticatedAsTeacher
        titles: TitlesResponse! @authenticated
        units: UnitsResponse! @authenticated
        parts: PartsResponse! @authenticated
        part(id: ID!): PartResponse! @authenticated
        projects: ProjectsResponse! @authenticated
        project(id: ID!): ProjectResponse! @authenticated
        projectTags: ProjectTagsResponse! @authenticated
        assignedTags(teacherId: ID!): AssignedTagsResponse! @authenticatedAsTeacher
        assignedProjects(id: ID!): AssignedProjectsResponse @authenticated
        assignedStudentProjects(studentId: ID!): AssignedProjectsResponse @authenticatedAsTeacher
        # assignedProject(projectId:ID):AssignedProject @ authenticated
        notifications: NotificationsResponse! @authenticated
        notification(id: ID!): NotificationResponse! @authenticated
        unreadNotificationCount: UnreadNotificationCountResponse! @authenticated 
        conversations: [Conversation!]!
        conversation(id: ID!): Conversation
        messages(conversationId: ID!): [Message!]!
        searchUsers(query: String!): [User!]!
        workplaces: WorkplacesResponse! @authenticatedAsTeacher
        workplace(id: ID!): WorkplaceResponse! @authenticatedAsTeacher
        internships(studentId: ID!): InternshipsResponse! @authenticatedAsTeacher
        jobSupervisors: JobSupervisorsResponse! @authenticatedAsTeacher
        jobSupervisorsByWorkplace(workplaceId: ID!): JobSupervisorsWithWorkplaceResponse! @authenticatedAsTeacher
        jobSupervisor(jobSupervisorId: ID!): JobSupervisorResponse! @authenticatedAsTeacher
        assignedTeachingProjects(teacherId: ID!): AssignedTeachingProjectsResponse! @authenticatedAsTeacher
        assignedStudentGroups(teacherId: ID!): AssignedStudentGroupsResponse! @authenticatedAsTeacher
    }

    type Mutation {

        login(idToken: String!): LoginResponse!

        # this mutation can only be done once by a student, while a student's profile has not been set up
        # assigns TVP for the student automatically, if FullCompletion is chosen
        # after performing this mutation a new token should be generated
        setUpStudent(studentId: ID!, studentSetupInput: StudentSetupInput!): SetUpStudentResponse! @authenticatedAsStudent

        requestMagicLink(email: String!): MagicLinkRequestResponse!
        verifyMagicLink(id: ID!, token: String!): MagicLinkVerifyResponse!

        createProject(project: CreateProjectInput!): CreateProjectResponse! @authenticatedAsTeacher
        updateProject(id: ID!, project: UpdateProjectInput!): UpdateProjectResponse! @authenticatedAsTeacher
        createPart(part: CreatePartInput!): CreatePartResponse! @authenticatedAsTeacher
        updatePart(id: ID!, part: CreatePartInput!): UpdatePartResponse! @authenticatedAsTeacher
        changeProjectStatus(id: ID!, status: ProjectStatus!, studentId: ID!, teacherComment: String): ChangeProjectStatusResponse! @authenticatedAsTeacher
        updatePartOrder(unitId: ID!, partOrder: [ID!]!): GenericResponse! @authenticatedAsTeacher
        createProjectTag(name: String!): CreateProjectTagResponse! @authenticatedAsTeacher
        assignProjectToStudent(studentId: ID! , projectId:ID! ): GenericResponse!  @authenticated
        updateStudentProject(studentId: ID! , projectId:ID!, update: UpdateStudentProjectInput!) : GenericResponse @authenticated
        unassignProjectFromStudent(studentId:ID! , projectId:ID!) : GenericResponse   @authenticated
        createWorktimeEntry(studentId:ID! , projectId:ID!, entry: StudentWorktimeInput): WorktimeEntryResponse @authenticated
        deleteWorktimeEntry(id:ID!): WorktimeEntryResponse @authenticated
        markNotificationAsRead(id: ID!): MarkNotificationAsReadResponse! @authenticated
        
        # remove once not needed
        debugSendNotification(recipients: [ID!]!, notification: String!): Int!

        createConversation(participantIds: [ID!]!): Conversation!
        sendMessage(conversationId: ID!, content: String!): Message!
        markMessageAsRead(messageId: ID!): Message!

        assignTeachingProject(userId: ID!, projectId: ID!): AssignTeachingProjectResponse @authenticatedAsTeacher
        unassignTeachingProject(userId: ID!, projectId: ID!): UnassignTeachingProjectResponse @authenticatedAsTeacher
        updateTeachingProjectAssigns(userId: ID!, assignProjectIds: [ID!]!, unassignProjectIds: [ID!]!): UpdateTeachingProjectAssignsResponse @authenticatedAsTeacher

        assignStudentGroups(userId: ID!, groupIds: [ID!]!): AssignStudentGroupsResponse @authenticatedAsTeacher
        unassignStudentGroups(userId: ID!, groupIds: [ID!]!): UnassignStudentGroupsResponse @authenticatedAsTeacher
        updateStudentGroupAssigns(userId: ID!, assignGroupIds: [ID!]!, unassignGroupIds: [ID!]!): UpdateStudentGroupAssignsResponse @authenticatedAsTeacher

        assignTags(userId: ID!, tagIds: [ID!]!): AssignTagsResponse @authenticatedAsTeacher
        unassignTags(userId: ID!, tagIds: [ID!]!): UnassignTagsResponse @authenticatedAsTeacher
        updateTagAssigns(userId: ID!, assignedTagIds: [ID!]!, unassignedTagIds: [ID!]!): UpdateTagAssignsResponse @authenticatedAsTeacher

        createWorkplace(name: String!): CreateWorkplaceResponse! @authenticatedAsTeacher
        editWorkplace(id: ID!, name: String!): EditWorkplaceResponse! @authenticatedAsTeacher
        deleteWorkplace(id: ID!): DeleteWorkplaceResponse! @authenticatedAsTeacher

        assignJobSupervisor(workplaceId: ID!, jobSupervisorId: ID!): AssignJobSupervisorResponse! @authenticatedAsTeacher
        unassignJobSupervisor(workplaceId: ID!, jobSupervisorId: ID!): UnassignJobSupervisorResponse! @authenticatedAsTeacher
        updateJobSupervisorAssigns(workplaceId: ID!, assignIds: [ID!]!, unassignIds: [ID!]!): UpdateJobSupervisorAssignsResponse! @authenticatedAsTeacher
        createJobSupervisor(jobSupervisor: JobSupervisorInput!): CreateJobSupervisorResponse! @authenticatedAsTeacher
        deleteJobSupervisor(id: ID!): deleteJobSupervisorResponse! @authenticatedAsTeacher
        editJobSupervisor(id: ID!, jobSupervisor: JobSupervisorInput!): EditJobSupervisorResponse @authenticatedAsTeacher

        createInternship(internship: InternshipInput): CreateInternshipResponse! @authenticatedAsTeacher
        deleteInternship(internshipId: ID!): DeleteInternshipResponse! @authenticatedAsTeacher
        editInternship(internshipId: ID!, internship: InternshipInput!): EditInternshipResponse! @authenticatedAsTeacher
    }

    # --- End of Query & Mutation ---

`
const typeDefs = newLocal

export default typeDefs
