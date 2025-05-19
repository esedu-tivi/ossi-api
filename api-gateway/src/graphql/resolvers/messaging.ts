import axios from 'axios';
import { publisher, subscriber } from '../../redis-client.js';
import { PubSub } from 'graphql-subscriptions';
import { Context } from '../context.js';

const messagingPubSub = new PubSub();
let redisSubscriptionInitialized = false;

// Initialize Redis subscription once
const initializeRedisSubscription = () => {
    if (!redisSubscriptionInitialized) {
        subscriber.subscribe('message_received', (message) => {
            const parsedMessage = JSON.parse(message);
            messagingPubSub.publish(`MESSAGE_RECEIVED.${parsedMessage.conversationId}`, {
                messageReceived: parsedMessage
            });
        });
        redisSubscriptionInitialized = true;
    }
};

export const MessagingResolvers = {
    Query: {
        conversations: async (_, __, context: Context) => {
            try {
                if (!context.user?.email) {
                    return [];
                }

                // Publish request for conversations
                await publisher.publish('get_conversations', JSON.stringify({
                    userEmail: context.user.email
                }));

                // Wait for response
                return new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Conversations fetch timeout'));
                    }, 5000);

                    subscriber.subscribe('conversations_response', (message) => {
                        clearTimeout(timeout);
                        subscriber.unsubscribe('conversations_response');
                        resolve(JSON.parse(message));
                    });
                });
            } catch (error) {
                console.error('Error fetching conversations:', error);
                return [];
            }
        },
        messages: async (_, { conversationId }, context: Context) => {
            try {
                if (!context.user?.email) {
                    return [];
                }

                // Publish request for messages
                await publisher.publish('get_messages', JSON.stringify({
                    conversationId,
                    userEmail: context.user.email
                }));

                // Wait for response
                return new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Messages fetch timeout'));
                    }, 5000);

                    subscriber.subscribe('messages_response', (message) => {
                        clearTimeout(timeout);
                        subscriber.unsubscribe('messages_response');
                        resolve(JSON.parse(message));
                    });
                });
            } catch (error) {
                console.error('Error fetching messages:', error);
                return [];
            }
        },
        searchUsers: async (_, { query }, context: Context) => {
            try {
                console.log('API Gateway searching users with query:', query);
                console.log('Context:', context);
                console.log('Messaging server URL:', process.env.INTERNAL_MESSAGING_SERVER_URL);

                const response = await axios.post(
                    `${process.env.INTERNAL_MESSAGING_SERVER_URL}/graphql`,
                    {
                        query: `
                            query SearchUsers($query: String!) {
                                searchUsers(query: $query) {
                                    id
                                    firstName
                                    lastName
                                    email
                                    phoneNumber
                                    archived
                                }
                            }
                        `,
                        variables: { query },
                    },
                    {
                        headers: {
                            Authorization: context.user?.email || '',
                            'Content-Type': 'application/json',
                        },
                    }
                );

                console.log('Search response:', response.data);
                return response.data?.data?.searchUsers || [];
            } catch (error) {
                console.error('Error searching users:', error);
                console.error('Error details:', {
                    url: process.env.INTERNAL_MESSAGING_SERVER_URL,
                    query,
                    context: context.user?.email
                });
                return [];
            }
        },
    },
    Mutation: {
        createConversation: async (_, { participantIds }, context) => {
            try {
                if (!context.user?.email) {
                    throw new Error('User not authenticated');
                }

                await publisher.publish('create_conversation', JSON.stringify({
                    participantIds,
                    userEmail: context.user.email
                }));

                return new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Create conversation timeout'));
                    }, 5000);

                    subscriber.subscribe('conversation_created', (message) => {
                        clearTimeout(timeout);
                        subscriber.unsubscribe('conversation_created');
                        resolve(JSON.parse(message));
                    });
                });
            } catch (error) {
                console.error('Error creating conversation:', error);
                throw error;
            }
        },
        sendMessage: async (_, { conversationId, content }, context: Context) => {
            try {
                if (!context.user?.email) {
                    throw new Error('User not authenticated');
                }

                // Publish message to Redis for messaging server to process
                await publisher.publish('new_message', JSON.stringify({
                    conversationId,
                    content,
                    sender: context.user
                }));

                // Wait for response from messaging server
                return new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Message sending timeout'));
                    }, 5000);

                    subscriber.subscribe('message_received', (message) => {
                        const parsedMessage = JSON.parse(message);
                        if (parsedMessage.conversationId === conversationId) {
                            clearTimeout(timeout);
                            subscriber.unsubscribe('message_received');
                            resolve(parsedMessage);
                        }
                    });
                });
            } catch (error) {
                console.error('Error sending message:', error);
                throw error;
            }
        },
    },
    Subscription: {
        messageReceived: {
            subscribe: (_, { conversationId }) => {
                initializeRedisSubscription();
                return messagingPubSub.asyncIterator([`MESSAGE_RECEIVED.${conversationId}`]);
            }
        }
    }
};
