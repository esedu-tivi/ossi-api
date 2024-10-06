import { ApolloServer, BaseContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { typeDefs } from '../graphql/type-defs.js';
import { Mutation } from '../graphql/resolvers/mutation.js';
import { Query } from '../graphql/resolvers/query.js';
import { config } from '../config.js';

const graphqlRouter = express.Router();

interface UserContext extends JwtPayload {
    id: string,
    firstName: string,
    lastName: string,
    email: string
} 

interface Context {
    user: UserContext | null
}

const resolvers = {
    Query,
    Mutation
}

const server = new ApolloServer<Context>({
    typeDefs,
    resolvers
});

await server.start();

graphqlRouter.use('/', cors<cors.CorsRequest>(), express.json(), expressMiddleware(server, {
    context: async ({ req }) => {
        if (req.headers.authorization) {
            return { 
                user: jwt.verify(req.headers.authorization, config.JWT_SECRET_KEY) as UserContext
            }
        }

        return {
            user: null
        }
    }
}))

export { graphqlRouter };