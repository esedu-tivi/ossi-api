const typeDefs = `#graphql
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    phoneNumber: String
    archived: Boolean!
  }

  type Message {
    id: ID!
    conversationId: ID!
    sender: User!
    content: String!
    readBy: [User!]!
    createdAt: String!
  }

  type Conversation {
    id: ID!
    participants: [User!]!
    lastMessage: Message
    createdAt: String!
  }

  type Query {
    conversations: [Conversation!]!
    conversation(id: ID!): Conversation
    messages(conversationId: ID!): [Message!]!
    searchUsers(query: String!): [User!]!
  }

  type Mutation {
    createConversation(participantIds: [ID!]!): Conversation!
    sendMessage(conversationId: ID!, content: String!): Message!
    markMessageAsRead(messageId: ID!): Message!
  }

  type Subscription {
    messageReceived(conversationId: ID!): Message!
    conversationUpdated(userId: ID!): Conversation!
  }
`;

export { typeDefs }; 