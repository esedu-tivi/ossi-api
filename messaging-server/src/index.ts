import 'dotenv/config'
import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { publisher, subscriber } from './redis-client.js';
import { Message } from './models/message.js';
import mongoose from 'mongoose';
import { Conversation } from './models/conversation.js';
import { MessageDocument, ConversationDocument } from './types.js';
import { getUserFromDatabase } from './resolvers.js';
import { Types } from 'mongoose';

// Connect to MongoDB
mongoose.connect("mongodb://mongo:27017/messaging")
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Create schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create Apollo Server
const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
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

// Kuunnellaan uusia viestejä API Gatewaylta
subscriber.subscribe('new_message', async (message) => {
  try {
    const { conversationId, content, sender } = JSON.parse(message);
    
    const newMessage = await Message.create({
      conversationId,
      content,
      sender: sender.email,
      readBy: [sender.email],
      createdAt: new Date()
    });

    // Update conversation's lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id
    });

    await publisher.publish('message_received', JSON.stringify({
      id: newMessage._id,
      conversationId,
      content,
      sender,
      readBy: [sender],
      createdAt: newMessage.createdAt
    }));

  } catch (error) {
    console.error('Error processing message:', error);
  }
});

subscriber.subscribe('get_conversations', async (message) => {
  try {
    const { userEmail } = JSON.parse(message);
    
    const conversations = await Conversation.find({
      participants: userEmail
    }).populate<{ lastMessage: MessageDocument }>('lastMessage');
    
    const mappedConversations = await Promise.all(conversations.map(async (conv: ConversationDocument) => ({
      id: conv._id.toString(),
      participants: await Promise.all(conv.participants.map(email => getUserFromDatabase(email))),
      lastMessage: conv.lastMessage && 'content' in conv.lastMessage ? {
        id: conv.lastMessage._id.toString(),
        content: conv.lastMessage.content,
        createdAt: conv.lastMessage.createdAt.toISOString(),
        sender: await getUserFromDatabase(conv.lastMessage.sender)
      } : null,
      createdAt: conv.createdAt.toISOString()
    })));

    await publisher.publish('conversations_response', JSON.stringify(mappedConversations));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    await publisher.publish('conversations_response', JSON.stringify([]));
  }
});

subscriber.subscribe('get_messages', async (message) => {
    try {
        const { conversationId, userEmail } = JSON.parse(message);

        // Verify user is part of the conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(userEmail)) {
            throw new Error('Not authorized to view these messages');
        }

        const messages = await Message.find({ 
            conversationId: new Types.ObjectId(conversationId) 
        }).sort({ createdAt: 1 });

        const mappedMessages = await Promise.all(messages.map(async (msg) => ({
            id: msg._id.toString(),
            content: msg.content,
            sender: await getUserFromDatabase(msg.sender),
            readBy: await Promise.all(msg.readBy.map((email) => getUserFromDatabase(email))),
            createdAt: msg.createdAt.toISOString()
        })));

        await publisher.publish('messages_response', JSON.stringify(mappedMessages));
    } catch (error) {
        console.error('Error processing get_messages:', error);
        await publisher.publish('messages_response', JSON.stringify([]));
    }
});

subscriber.subscribe('create_conversation', async (message) => {
    try {
        const { participantIds, userEmail } = JSON.parse(message);

        const conversation = await Conversation.create({
            participants: [...participantIds, userEmail],
            createdAt: new Date()
        });

        const mappedConversation = {
            id: conversation._id.toString(),
            participants: await Promise.all(conversation.participants.map(email => getUserFromDatabase(email))),
            lastMessage: null,
            createdAt: conversation.createdAt.toISOString()
        };

        await publisher.publish('conversation_created', JSON.stringify(mappedConversation));
    } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
    }
}); 