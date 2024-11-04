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

    interface User {
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
        phoneNumber: String
        archived: Boolean!
    }

    """
    Prototype schemas for types related to vocational studies

    type QualificationUnitPartProject {
        id: ID!
        name: String!
        description: String!            
    }

    type QualificationUnitPart {
        id: ID!
        name: String!
        description: String!
        projects: [QualificationUnitPartProject!]!
    }

    type QualificationUnit {
        id: Int!
        name: String!
        scope: Int!
            TODO: Check the data provided from the ePerusteet API.
            Possibly seperate requirements and assessment in description.
        description: String!
            TODO: check if this can be more dynamic. For now they are representing "teemoja" in Esedu.
        parts: [QualificationUnitPart!]!        
    }

    type Qualification {
            Qualification ID from ePerusteet.
            See for example https://eperusteet.opintopolku.fi/#/fi/ammatillinenperustutkinto/7861752/tiedot
        id: Int!
        name: String!

        qualificationTitle(id: Int!): QualificationTitle
        qualificationTitles: [QualificationTitle!]!

        qualificationUnit(id: Int!): QualificationUnit!
        qualificationUnits: [QualificationUnit!]!
    }

    type UndertakenQualificationProject {
        projectId: ID!
        isSentForReview: Boolean!
    }
"""

    type QualificationTitle {
        id: Int!
        name: String!
    }

    type Qualification {
        id: Int!
        name: String!
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

    type Query {
        me: CurrentUser!
        students: [Student!]!
    }

    type Mutation {
        login(idToken: String!): AuthResponse
    }
`

export { typeDefs }
