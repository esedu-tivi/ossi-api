import mongoose from 'mongoose';
import { ConversationDocument } from '../types.js';

const conversationSchema = new mongoose.Schema<ConversationDocument>({
  participants: [{
    type: String,
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Conversation = mongoose.model<ConversationDocument>('Conversation', conversationSchema); 