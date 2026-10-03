const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    chatName: {
      type: String,
      trim: true,
      default: 'New Conversation',
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    groupDescription: {
      type: String,
      default: 'Welcome to the group!',
    },
    groupAvatar: {
      type: String,
      default: 'https://api.dicebear.com/7.x/identicon/svg?seed=group',
    },
  },
  {
    timestamps: true,
  }
);

// Optimize query performance for fetching user conversations sorted by latest activity
chatSchema.index({ users: 1, updatedAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
