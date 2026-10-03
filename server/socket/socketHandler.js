const User = require('../models/User');

const onlineUsers = new Map(); // userId -> Set of socketIds

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] New client connected: ${socket.id}`);

    // When user authenticates/starts app
    socket.on('setup', async (userData) => {
      if (!userData || !userData._id) return;
      
      const userId = userData._id.toString();
      socket.userId = userId;
      socket.join(userId); // Personal room for direct alerts & mentions

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);

      // Update DB presence
      try {
        await User.findByIdAndUpdate(userId, { isOnline: true });
      } catch (err) {
        console.error('Error updating user online status:', err.message);
      }

      // Broadcast list of currently online user IDs to everyone
      io.emit('online_users', Array.from(onlineUsers.keys()));
      socket.emit('connected');
    });

    // Join a dedicated chat room
    socket.on('join_chat', (room) => {
      socket.join(room);
      console.log(`[Socket.IO] User ${socket.userId || socket.id} joined chat room: ${room}`);
    });

    // Leave a dedicated chat room
    socket.on('leave_chat', (room) => {
      socket.leave(room);
      console.log(`[Socket.IO] User ${socket.userId || socket.id} left chat room: ${room}`);
    });

    // Real-time typing indicators
    socket.on('typing', ({ room, user }) => {
      socket.in(room).emit('typing', { room, user });
    });

    socket.on('stop_typing', ({ room, user }) => {
      socket.in(room).emit('stop_typing', { room, user });
    });

    // Instant message delivery
    socket.on('new_message', (newMessageReceived) => {
      const chat = newMessageReceived.chat;

      if (!chat || !chat.users) {
        return console.log('chat.users not defined');
      }

      // Emit to everyone in the dedicated chat room except sender
      socket.to(chat._id).emit('message_received', newMessageReceived);

      // Also notify individual user personal rooms (for unread count badges in sidebar)
      chat.users.forEach((user) => {
        const targetUserId = typeof user === 'string' ? user : user._id.toString();
        if (targetUserId !== newMessageReceived.sender._id.toString()) {
          socket.to(targetUserId).emit('notification_received', newMessageReceived);
        }
      });
    });

    // Group chat updates (member added/removed, renamed)
    socket.on('group_updated', (updatedChat) => {
      socket.to(updatedChat._id).emit('group_updated', updatedChat);
      if (updatedChat.users) {
        updatedChat.users.forEach((user) => {
          const targetUserId = typeof user === 'string' ? user : user._id.toString();
          socket.to(targetUserId).emit('chat_list_updated', updatedChat);
        });
      }
    });

    // Mark message as read
    socket.on('mark_read', ({ chatId, messageId, userId }) => {
      socket.in(chatId).emit('message_read_receipt', { chatId, messageId, userId });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      const userId = socket.userId;

      if (userId && onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId);
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          try {
            await User.findByIdAndUpdate(userId, {
              isOnline: false,
              lastSeen: new Date(),
            });
          } catch (err) {
            console.error('Error updating user offline status:', err.message);
          }
          io.emit('online_users', Array.from(onlineUsers.keys()));
        }
      }
    });
  });
};

module.exports = { setupSocket };
