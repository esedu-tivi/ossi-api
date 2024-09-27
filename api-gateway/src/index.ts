import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import proxy from 'express-http-proxy'

import 'dotenv/config'
import { verifyToken } from './auth.js';
import { config } from './config.js';

const app = express();

const typeDefs = `#graphql
  interface User {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
  } 

  type Query {
    users: [User!]!
  }
`

const resolvers = {
  Query: {
    users: async () => {
      return []
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use('/graphql', verifyToken, cors<cors.CorsRequest>(), express.json(), expressMiddleware(server));
app.use('/auth', proxy(config.AUTH_SERVICE_URL, {
  proxyReqPathResolver: req => {
    return req.originalUrl
  }
}))

app.get('/authenticated', verifyToken, (req, res) => {
  res.json({ "user": res.locals.authenticatedUserInfo })
})

app.listen(3000)