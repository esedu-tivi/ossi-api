import 'dotenv/config'
import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';
import mongoose from 'mongoose';
import cors from 'cors';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

// Connect to MongoDB
mongoose.connect("mongodb://mongo:27017/messaging")
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Create schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

// Create PubSub instance for real-time messaging
export const pubsub = new PubSub();

// Hand in the schema we just created and have the WebSocketServer start listening
const serverCleanup = useServer({
  schema,
  context: async (ctx) => {
    const token = ctx.connectionParams?.Authorization || '';
    console.log('WebSocket connection context:', { token });
    return { 
      user: {
        email: token
      }
    };
  },
}, wsServer);

// Create Apollo Server
const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();

app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      try {
        const token = req.headers.authorization || '';
        console.log('GraphQL request context:', { token });
        return { 
          user: {
            email: token
          }
        };
      } catch (error) {
        console.error('Error creating context:', error);
        return { user: null };
      }
    },
  }),
);

// Add error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    
    res.status(statusCode).json({
        errors: [{
            message,
            extensions: {
                code: err.code || 'INTERNAL_SERVER_ERROR',
                stacktrace: process.env.NODE_ENV === 'development' ? err.stack?.split('\n') : undefined
            }
        }]
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/graphql`);
}); 