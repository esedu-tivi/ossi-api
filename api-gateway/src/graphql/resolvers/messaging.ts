import axios from 'axios';

export const MessagingResolvers = {
    Query: {
        conversations: async (_, __, context) => {
            try {
                if (!context.user?.email) {
                    console.log('No user email in context');
                    return [];
                }
                
                console.log('Fetching conversations for user:', context.user.email);
                
                const response = await axios.post(
                    `${process.env.INTERNAL_MESSAGING_SERVER_URL}/graphql`,
                    {
                        query: `
                            query {
                                conversations {
                                    id
                                    participants {
                                        id
                                        firstName
                                        lastName
                                        email
                                    }
                                    lastMessage {
                                        content
                                        createdAt
                                    }
                                    createdAt
                                }
                            }
                        `
                    },
                    {
                        headers: {
                            Authorization: context.user.email,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                
                console.log('API Gateway response:', response.data);
                
                // Always return an array, even if the response is null/undefined
                return response.data?.data?.conversations || [];
            } catch (error) {
                console.error('Error fetching conversations:', error);
                return [];
            }
        },
        messages: async (_, { conversationId }, context) => {
            try {
                const response = await axios.post(
                    `${process.env.INTERNAL_MESSAGING_SERVER_URL}/graphql`,
                    {
                        query: `
                            query GetMessages($conversationId: ID!) {
                                messages(conversationId: $conversationId) {
                                    id
                                    content
                                    sender {
                                        id
                                        firstName
                                        lastName
                                        email
                                    }
                                    readBy {
                                        id
                                        firstName
                                        lastName
                                    }
                                    createdAt
                                }
                            }
                        `,
                        variables: { conversationId }
                    },
                    {
                        headers: {
                            Authorization: context.user?.email || '',
                            'Content-Type': 'application/json',
                        },
                    }
                );

                console.log('Messages response:', response.data);
                return response.data?.data?.messages || [];
            } catch (error) {
                console.error('Error fetching messages:', error);
                return [];
            }
        },
        searchUsers: async (_, { query }, context) => {
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
                console.log('Creating conversation with participants:', participantIds);
                console.log('Context:', context);

                const response = await axios.post(
                    `${process.env.INTERNAL_MESSAGING_SERVER_URL}/graphql`,
                    {
                        query: `
                            mutation CreateConversation($participantIds: [ID!]!) {
                                createConversation(participantIds: $participantIds) {
                                    id
                                    participants {
                                        id
                                        firstName
                                        lastName
                                        email
                                    }
                                    createdAt
                                }
                            }
                        `,
                        variables: { participantIds }
                    },
                    {
                        headers: {
                            Authorization: context.user?.email || '',
                            'Content-Type': 'application/json',
                        },
                    }
                );

                console.log('Create conversation response:', response.data);
                return response.data?.data?.createConversation;
            } catch (error) {
                console.error('Error creating conversation:', error);
                console.error('Error response:', error.response?.data);
                throw error;
            }
        },
        sendMessage: async (_, { conversationId, content }, context) => {
            try {
                console.log('Sending message:', { conversationId, content });
                const response = await axios.post(
                    `${process.env.INTERNAL_MESSAGING_SERVER_URL}/graphql`,
                    {
                        query: `
                            mutation SendMessage($conversationId: ID!, $content: String!) {
                                sendMessage(conversationId: $conversationId, content: $content) {
                                    id
                                    content
                                    sender {
                                        id
                                        firstName
                                        lastName
                                        email
                                    }
                                    createdAt
                                }
                            }
                        `,
                        variables: { conversationId, content }
                    },
                    {
                        headers: {
                            Authorization: context.user?.email || '',
                            'Content-Type': 'application/json',
                        },
                    }
                );

                console.log('Send message response:', response.data);
                return response.data?.data?.sendMessage;
            } catch (error) {
                console.error('Error sending message:', error);
                console.error('Error details:', error.response?.data);
                throw error;
            }
        },
    },
};
