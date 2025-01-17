import { ApolloServer, BaseContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import typeDefs from '../graphql/type-defs.js';
import { Mutation } from '../graphql/resolvers/mutation.js';
import { Query } from '../graphql/resolvers/query.js';
import { config } from '../config.js';
import { Student } from '../graphql/resolvers/student.js';
import { Context, UserContext } from '../graphql/context.js';
import { QualificationProject } from '../graphql/resolvers/project.js';
import { QualificationUnitPart } from '../graphql/resolvers/part.js';
import { MessagingResolvers } from '../graphql/resolvers/messaging.js';

const graphqlRouter = express.Router();

const resolvers = {
    Notification: {
        __resolveType: (notification) => notification.kind
    },
    Query: {
        ...Query,
        ...MessagingResolvers.Query,
    },
    Mutation: {
        ...Mutation,
        ...MessagingResolvers.Mutation,
    },
    Student,
    QualificationUnitPart,
    QualificationProject,
};

const server = new ApolloServer<Context>({
    typeDefs,
    resolvers
});

await server.start();

graphqlRouter.use('/', cors<cors.CorsRequest>(), express.json(), expressMiddleware(server, {
    context: async ({ req }) => {
        if (req.headers.authorization) {
            const user = jwt.verify(req.headers.authorization, config.JWT_SECRET_KEY) as UserContext;
            return { 
                user: {
                    ...user,
                    email: user.email
                }
            };
        }
        return { user: null };
    }
}));

export { graphqlRouter };
