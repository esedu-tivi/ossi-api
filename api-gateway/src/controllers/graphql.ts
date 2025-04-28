import { ApolloServer, BaseContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { typeDefs } from '../graphql/type-defs.js';
import { Mutation } from '../graphql/resolvers/mutation.js';
import { Query } from '../graphql/resolvers/query.js';
import { config } from '../config.js';
import { Student } from '../graphql/resolvers/student.js';
import { ApolloContext, UserContext } from '../graphql/context.js';
import { QualificationProject } from '../graphql/resolvers/project.js';
import { QualificationUnitPart } from '../graphql/resolvers/part.js';
import { QualificationUnit } from '../graphql/resolvers/unit.js';
import { StudentManagementAPI } from '../graphql/data-sources/student-management-api.js';
import { User } from '../graphql/resolvers/user.js';
import { Notification } from '../graphql/resolvers/notification.js';
import { makeExecutableSchema } from 'graphql-tools';
import { authenticatedAsStudentDirectiveTransformer, authenticatedAsTeacherDirectiveTransformer, authenticatedDirectiveTransformer } from '../graphql/directive-transformers.js';

const graphqlRouter = express.Router();

const resolvers = {
    Notification,
    User,
    Query,
    Mutation,
    Student,
    QualificationUnitPart,
    QualificationProject,
    QualificationUnit,
}

let schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

schema = authenticatedDirectiveTransformer(schema);
schema = authenticatedAsTeacherDirectiveTransformer(schema);
schema = authenticatedAsStudentDirectiveTransformer(schema);

const server = new ApolloServer<ApolloContext>({ schema });

await server.start();

graphqlRouter.use('/', cors<cors.CorsRequest>(), express.json(), expressMiddleware(server, {
    context: async ({ req }) => {
        if (req.headers.authorization) {
            return { 
                user: jwt.verify(req.headers.authorization, config.JWT_SECRET_KEY) as UserContext,
                dataSources: {
                    studentManagementAPI: new StudentManagementAPI({ token: req.headers.authorization })
                }
            }
        }
        
        // todo
        return {
            user: null,
            dataSources: {
                studentManagementAPI: new StudentManagementAPI({ token: req.headers.authorization })
            }
        }
    }
}))

export { graphqlRouter };
