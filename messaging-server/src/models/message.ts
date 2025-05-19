import mongoose from 'mongoose';
import { MessageDocument } from '../types.js';

const messageSchema = new mongoose.Schema<MessageDocument>({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  readBy: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Message = mongoose.model<MessageDocument>('Message', messageSchema); 