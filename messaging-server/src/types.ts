import { Document, Types } from 'mongoose';

export interface Context {
  user?: {
    email: string;
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  archived: boolean;
}

export interface IMessage {
  conversationId: Types.ObjectId;
  sender: string;
  content: string;
  readBy: string[];
  createdAt: Date;
}

export interface IConversation {
  participants: string[];
  lastMessage?: Types.ObjectId;
  createdAt: Date;
}

export interface MessageDocument extends Document {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  sender: string;
  content: string;
  readBy: string[];
  createdAt: Date;
}

export interface ConversationDocument extends Document {
  _id: Types.ObjectId;
  participants: string[];
  lastMessage?: Types.ObjectId | MessageDocument;
  createdAt: Date;
}

export interface ResolverContext {
  user?: {
    email: string;
  };
}

export interface CreateConversationInput {
  participantIds: string[];
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
}
