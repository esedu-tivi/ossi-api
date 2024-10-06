const typeDefs = `#graphql
    type AuthResponse {
        token: String!
        user: User
    }

    type User {
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
    }

    type Query {
        users: [User!]!
        testAuthentication: Boolean!
    }

    type Mutation {
        login(idToken: String!): AuthResponse
    }
`

export { typeDefs }