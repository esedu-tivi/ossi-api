const typeDefs = `#graphql
    enum AuthorityScope {
        STUDENT
        TEACHER
        JOB_SUPERVISOR
        ADMIN
    }
    
    type AuthResponse {
        token: String!
        user: User!
        scope: AuthorityScope!
    }

    type Empty {}

    interface User {
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
        phoneNumber: String
        archived: Boolean!
    }

    type LocalizedString {
        fi: String
        en: String
        sv: String
    }

    type QualificationTitle {
        id: Int!
        name: String!
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

    type Student implements User {
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
        archived: Boolean!
        phoneNumber: String
        
        """
        selectedQualificationUnits: [QualificationUnit!]!
        currentlyUndertakenQualificationProjects: [UndertakenQualificationProject!]!
        """

        groupId: String!
        studyingQualification: Qualification
        studyingQualificationTitle: QualificationTitle
    }
    
    type Teacher implements User {
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
        archived: Boolean!
        phoneNumber: String

        teachingQualification: Qualification
        followingStudents: [Student!]!
    }

    union CurrentUser = Student | Teacher

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
        me: CurrentUser!
        students: [Student!]!

        units: [QualificationUnit!]!

        parts: [QualificationUnitPart!]!
        part(id: ID!): QualificationUnitPart

        projects: [QualificationProject!]!
        project(id: ID!): QualificationProject

        projectTags: [QualificationProjectTag!]!

        notifications: [Notification!]!
    }

    input CreateProjectInput {
        name: String!
        description: String!
        materials: String!
        # osaamiset: [ID!]
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
        # osaamiset: [ID!]
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

    type Mutation {
        login(idToken: String!): AuthResponse
        createProject(project: CreateProjectInput!): QualificationProject!
        createPart(part: CreatePartInput!): QualificationUnitPart!
        updateProject(id: ID!, project: UpdateProjectInput!): QualificationProject!
        updatePart(id: ID!, part: CreatePartInput!): QualificationUnitPart!
        updatePartOrder(id: ID!, partOrder: [ID!]!): Empty!
        createProjectTag(name: String!): QualificationProjectTag!
        
        # remove once not needed
        debugSendNotification(recipients: [ID!]!, notification: String!): Int!
    }
`

export { typeDefs }
