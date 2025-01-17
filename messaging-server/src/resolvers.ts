import { Conversation } from './models/conversation.js';
import { Message } from './models/message.js';
import { pubsub } from './index.js';
import mongoose, { Types } from 'mongoose';
import {
  Context,
  User,
  CreateConversationInput,
  SendMessageInput,
  ResolverContext,
  ConversationDocument,
  MessageDocument
} from './types.js';

const MOCK_USERS = [
    {
        id: 'test1@example.com',
        firstName: 'Test',
        lastName: 'User 1',
        email: 'test1@example.com',
        phoneNumber: '+1234567890',
        archived: false
    },
    {
        id: 'test2@example.com',
        firstName: 'Test',
        lastName: 'User 2',
        email: 'test2@example.com',
        phoneNumber: '+1234567891',
        archived: false
    },
    {
        id: 'teacher@esedulainen.fi',
        firstName: 'Teacher',
        lastName: 'Test',
        email: 'teacher@esedulainen.fi',
        phoneNumber: '+1234567892',
        archived: false
    }
];

const getMockUser = (email: string): User => {
    const mockUser = MOCK_USERS.find(u => u.email === email);
    if (mockUser) {
        return mockUser;
    }
    return {
        id: email,
        firstName: email.split('@')[0],
        lastName: 'User',
        email: email,
        phoneNumber: '+1234567890',
        archived: false
    };
};

const MESSAGE_RECEIVED = 'MESSAGE_RECEIVED';
const CONVERSATION_UPDATED = 'CONVERSATION_UPDATED';

export const resolvers = {
    Query: {
        conversations: async (_: unknown, __: unknown, context: ResolverContext) => {
            console.log('Messaging server received conversations query');
            console.log('Context:', context);
            
            try {
                if (!context.user?.email) {
                    console.log('No user email in context');
                    return [];
                }
                
                console.log('Fetching conversations for user:', context.user.email);
                const conversations = await Conversation.find({
                    participants: context.user.email
                }).populate<{ lastMessage: MessageDocument }>('lastMessage');
                
                console.log('Found conversations:', conversations);
                
                const mappedConversations = conversations.map((conv: ConversationDocument) => ({
                    id: conv._id.toString(),
                    participants: conv.participants.map((email: string) => getMockUser(email)),
                    lastMessage: conv.lastMessage && 'content' in conv.lastMessage ? {
                        id: conv.lastMessage._id.toString(),
                        content: conv.lastMessage.content,
                        createdAt: conv.lastMessage.createdAt.toISOString(),
                        sender: getMockUser(conv.lastMessage.sender)
                    } : null,
                    createdAt: conv.createdAt.toISOString()
                }));

                console.log('Mapped conversations:', mappedConversations);
                return mappedConversations;
            } catch (error) {
                console.error('Error in conversations resolver:', error);
                return [];
            }
        },

        messages: async (
            _: unknown,
            { conversationId }: { conversationId: string },
            { user }: ResolverContext
        ) => {
            try {
                console.log('Fetching messages for conversation:', conversationId);
                console.log('User:', user?.email);

                if (!user?.email) {
                    throw new Error('User not authenticated');
                }

                // Verify user is part of the conversation
                const conversation = await Conversation.findById(conversationId);
                if (!conversation || !conversation.participants.includes(user.email)) {
                    throw new Error('Not authorized to view these messages');
                }

                const messages = await Message.find({ 
                    conversationId: new Types.ObjectId(conversationId) 
                }).sort({ createdAt: 1 });
                
                return messages.map((msg: MessageDocument) => ({
                    id: msg._id.toString(),
                    content: msg.content,
                    sender: getMockUser(msg.sender),
                    readBy: msg.readBy.map((email: string) => getMockUser(email)),
                    createdAt: msg.createdAt.toISOString()
                }));
            } catch (error) {
                console.error('Error fetching messages:', error);
                throw error;
            }
        },

        searchUsers: async (
            _: unknown,
            { query }: { query: string },
            { user }: ResolverContext
        ) => {
            try {
                console.log('Searching users with query:', query);
                console.log('Current user:', user?.email);

                const users = MOCK_USERS;
                const filteredUsers = users.filter(u => 
                    u.email !== user?.email && 
                    (u.firstName.toLowerCase().includes(query.toLowerCase()) || 
                     u.lastName.toLowerCase().includes(query.toLowerCase()) || 
                     u.email.toLowerCase().includes(query.toLowerCase()))
                );

                console.log('Filtered users:', filteredUsers);
                return filteredUsers;
            } catch (error) {
                console.error('Error searching users:', error);
                return [];
            }
        }
    },

    Mutation: {
        createConversation: async (
            _: unknown,
            { participantIds }: { participantIds: string[] },
            { user }: ResolverContext
        ) => {
            try {
                console.log('Creating conversation with participants:', participantIds);
                console.log('Current user:', user);

                if (!user?.email) {
                    throw new Error('User not authenticated');
                }

                const conversation = await Conversation.create({
                    participants: [...participantIds, user.email],
                    createdAt: new Date()
                }) as ConversationDocument;

                const mappedConversation = {
                    id: conversation._id.toString(),
                    participants: conversation.participants.map((email: string) => getMockUser(email)),
                    lastMessage: null,
                    createdAt: conversation.createdAt.toISOString()
                };

                // Notify all participants about the new conversation
                participantIds.forEach((participantId: string) => {
                    pubsub.publish(CONVERSATION_UPDATED, {
                        conversationUpdated: mappedConversation,
                        userId: participantId
                    });
                });

                console.log('Created conversation:', mappedConversation);
                return mappedConversation;
            } catch (error) {
                console.error('Error creating conversation:', error);
                throw error;
            }
        },

        sendMessage: async (
            _: unknown,
            { conversationId, content }: { conversationId: string; content: string },
            { user }: ResolverContext
        ) => {
            try {
                console.log('Sending message:', { conversationId, content });
                console.log('User:', user?.email);

                if (!user?.email) {
                    throw new Error('User not authenticated');
                }

                // Verify user is part of the conversation
                const conversation = await Conversation.findById(conversationId);
                if (!conversation || !conversation.participants.includes(user.email)) {
                    throw new Error('Not authorized to send messages to this conversation');
                }

                const message = await Message.create({
                    conversationId: new Types.ObjectId(conversationId),
                    sender: user.email,
                    content,
                    readBy: [user.email],
                    createdAt: new Date()
                }) as MessageDocument;

                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: message._id
                });

                const mappedMessage = {
                    id: message._id.toString(),
                    content: message.content,
                    sender: getMockUser(message.sender),
                    readBy: message.readBy.map((email: string) => getMockUser(email)),
                    createdAt: message.createdAt.toISOString()
                };

                // Notify subscribers
                pubsub.publish(`${MESSAGE_RECEIVED}.${conversationId}`, {
                    messageReceived: mappedMessage,
                    conversationId
                });

                return mappedMessage;
            } catch (error) {
                console.error('Error sending message:', error);
                throw error;
            }
        }
    },

    Subscription: {
        messageReceived: {
            subscribe: (_: unknown, { conversationId }: { conversationId: string }) => 
                pubsub.asyncIterator([`${MESSAGE_RECEIVED}.${conversationId}`])
        },

        conversationUpdated: {
            subscribe: (_: unknown, { userId }: { userId: string }) =>
                pubsub.asyncIterator([`${CONVERSATION_UPDATED}.${userId}`])
        }
    }
}; 