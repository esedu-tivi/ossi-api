import 'dotenv/config'
import { ApolloServer, BaseContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import typeDefs from '../graphql/type-defs';
import { Mutation } from '../graphql/resolvers/mutation';
import { Query } from '../graphql/resolvers/query';
import { config } from '../config';
import { Student } from '../graphql/resolvers/student';
import { ApolloContext, UserContext } from '../graphql/context';
import { QualificationProject } from '../graphql/resolvers/project';
import { QualificationUnitPart } from '../graphql/resolvers/part';
import { QualificationUnit } from '../graphql/resolvers/unit';
import { StudentManagementAPI } from '../graphql/data-sources/student-management-api';
import { User } from '../graphql/resolvers/user';
import { Notification } from '../graphql/resolvers/notification';
import { makeExecutableSchema } from 'graphql-tools';
import { authenticatedAsStudentDirectiveTransformer, authenticatedAsTeacherDirectiveTransformer, authenticatedDirectiveTransformer } from '../graphql/directive-transformers';
import { QualificationTitle } from '../graphql/resolvers/title';
import { ProjectReturnNotification } from '../graphql/resolvers/project-return-notification';
import { ProjectUpdateNotification } from '../graphql/resolvers/project-update-notification';
import { dateTimeScalar } from '../graphql/scalars/datetime';
import { MessagingResolvers } from '../graphql/resolvers/messaging';

const graphqlRouter = express.Router();

const resolvers = {
    DateTime: dateTimeScalar,
    Notification,
    ProjectReturnNotification,
    ProjectUpdateNotification,
    User,
    Query: {
        ...Query,
        ...MessagingResolvers.Query,
    },
    Mutation: {
        ...Mutation,
        ...MessagingResolvers.Mutation,
    },
    Student,
    QualificationTitle,
    QualificationUnitPart,
    QualificationProject,
    QualificationUnit,
};

let schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

schema = authenticatedDirectiveTransformer(schema);
schema = authenticatedAsTeacherDirectiveTransformer(schema);
schema = authenticatedAsStudentDirectiveTransformer(schema);

const server = new ApolloServer<ApolloContext>({ schema });

(async () => {
    await server.start();

    graphqlRouter.use('/', cors<cors.CorsRequest>(), express.json(), expressMiddleware(server, {
        context: async ({ req }) => {
            if (req.headers.authorization) {
                const user = (process.env.NODE_ENV === 'development')
                    ? jwt.decode(req.headers.authorization) as UserContext
                    : jwt.verify(req.headers.authorization, config.JWT_SECRET_KEY) as UserContext;

                return {
                    user,
                    dataSources: {
                        studentManagementAPI: new StudentManagementAPI({ token: req.headers.authorization })
                    },
                    token: req.headers.authorization
                }
            }

            // todo
            return {
                user: null,
                dataSources: {
                    studentManagementAPI: new StudentManagementAPI({ token: req.headers.authorization })
                },
                token: null
            }
        }
    }));
})();

export { graphqlRouter };
