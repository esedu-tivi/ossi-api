const typeDefs = `#graphql
    directive @authenticated on FIELD_DEFINITION
    directive @authenticatedAsTeacher on FIELD_DEFINITION
    directive @authenticatedAsStudent on FIELD_DEFINITION
    
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

    enum QualificationCompletion {
        FULL_COMPLETION
        PARTIAL_COMPLETION
    }
    
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
        id: Int!
        name: String!
        mandatoryUnits: [QualificationUnit!]!
    }

    type Qualification {
        id: Int!
        name: String!
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
        id: Int!
        name: String!
        description: String!
        duration: String!
        materials: String!
        isActive: Boolean!
        includedInQualificationUnitParts: [QualificationUnitPart!]!
        competenceRequirements: [VocationalCompetenceRequirementDescription!]!
        tags: [QualificationProjectTag!]!
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
        assignedQualificationUnits: [QualificationUnit!]!
    }

    type Teacher implements User {
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
        archived: Boolean!

        # todo
        teachingQualification: Qualification
        teachingQualificationTitle: QualificationTitle
    }

    type ProjectReturnNotification {
        id: ID!
        projectId: ID!
        projectSubmitterStudentId: ID!
        hasBeenRead: Boolean!
    }

    type ProjectUpdateNotification {
        id: ID!
        projectId: ID!
        updateMessage: String!
        hasBeenRead: Boolean!
    }

    union Notification = ProjectReturnNotification | ProjectUpdateNotification

    type Query {
        me: User! @authenticated
        amISetUp: Boolean! @authenticated

        students: [Student!]! @authenticatedAsTeacher

        titles: [QualificationTitle!]! @authenticated

        units: [QualificationUnit!]! @authenticated

        parts: [QualificationUnitPart!]! @authenticated
        part(id: ID!): QualificationUnitPart @authenticated

        projects: [QualificationProject!]! @authenticated
        project(id: ID!): QualificationProject @authenticated

        projectTags: [QualificationProjectTag!]! @authenticated

        notifications: [Notification!]! @authenticated
    }

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
        name: String!
        description: String!
        materials: String!
        duration: Int!
        includedInParts: [ID!]!
        competenceRequirements: [ID!]!
        tags: [ID!]!
        isActive: Boolean!
        notifyStudents: Boolean!
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
    
    type LoginResponse {
        status: Int!
        success: Boolean!
        message: String
        token: String
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
        part: QualificationProject
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

    type Mutation {
        login(idToken: String!): LoginResponse!
       
        # this mutation can only be done once by a student, while a student's profile has not been set up
        # assigns TVP for the student automatically, if FullCompletion is chosen
        # after performing this mutation a new token should be generated
        setUpStudent(studentId: ID!, studentSetupInput: StudentSetupInput!): SetUpStudentResponse! @authenticatedAsStudent

        createProject(project: CreateProjectInput!): CreateProjectResponse! @authenticatedAsTeacher
        updateProject(id: ID!, project: UpdateProjectInput!): UpdateProjectResponse! @authenticatedAsTeacher
        createPart(part: CreatePartInput!): CreatePartResponse! @authenticatedAsTeacher
        updatePart(id: ID!, part: CreatePartInput!): UpdatePartResponse! @authenticatedAsTeacher
        updatePartOrder(unitId: ID!, partOrder: [ID!]!): UpdatePartOrderResponse! @authenticatedAsTeacher
        createProjectTag(name: String!): CreateProjectTagResponse! @authenticatedAsTeacher
        
        # remove once not needed
        debugSendNotification(recipients: [ID!]!, notification: String!): Int!
    }
`

export { typeDefs }
