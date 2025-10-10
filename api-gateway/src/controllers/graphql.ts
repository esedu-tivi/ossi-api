import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { makeExecutableSchema } from "graphql-tools";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { type ApolloContext, type UserContext } from "../graphql/context.js";
import { StudentManagementAPI } from "../graphql/data-sources/student-management-api.js";
import {
    authenticatedAsStudentDirectiveTransformer,
    authenticatedAsTeacherDirectiveTransformer,
    authenticatedDirectiveTransformer,
} from "../graphql/directive-transformers.js";
import { MessagingResolvers } from "../graphql/resolvers/messaging.js";
import { Mutation } from "../graphql/resolvers/mutation.js";
import { Notification } from "../graphql/resolvers/notification.js";
import { QualificationUnitPart } from "../graphql/resolvers/part.js";
import { ProjectReturnNotification } from "../graphql/resolvers/project-return-notification.js";
import { ProjectUpdateNotification } from "../graphql/resolvers/project-update-notification.js";
import { QualificationProject } from "../graphql/resolvers/project.js";
import { Query } from "../graphql/resolvers/query.js";
import { Student } from "../graphql/resolvers/student.js";
import { QualificationTitle } from "../graphql/resolvers/title.js";
import { QualificationUnit } from "../graphql/resolvers/unit.js";
import { User } from "../graphql/resolvers/user.js";
import { dateTimeScalar } from "../graphql/scalars/datetime.js";
import typeDefs from "../graphql/type-defs.js";

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
                const user = (config.NODE_ENV === 'development')
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
export default graphqlRouter
