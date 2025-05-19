import { Document, Types } from 'mongoose';

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
