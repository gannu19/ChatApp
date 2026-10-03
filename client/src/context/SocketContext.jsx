import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const SOCKET_ENDPOINT = 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({}); // { [chatId]: Set or array of usernames }

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setSocketConnected(false);
      }
      return;
    }

    const newSocket = io(SOCKET_ENDPOINT, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.emit('setup', user);

    newSocket.on('connected', () => {
      setSocketConnected(true);
    });

    newSocket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    // Real-time typing listeners
    newSocket.on('typing', ({ room, user: typingUser }) => {
      setTypingUsers((prev) => {
        const currentList = prev[room] || [];
        if (!currentList.includes(typingUser.name)) {
          return { ...prev, [room]: [...currentList, typingUser.name] };
        }
        return prev;
      });
    });

    newSocket.on('stop_typing', ({ room, user: typingUser }) => {
      setTypingUsers((prev) => {
        const currentList = prev[room] || [];
        return { ...prev, [room]: currentList.filter((name) => name !== typingUser.name) };
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const joinChatRoom = (chatId) => {
    if (socket) {
      socket.emit('join_chat', chatId);
    }
  };

  const leaveChatRoom = (chatId) => {
    if (socket) {
      socket.emit('leave_chat', chatId);
    }
  };

  const emitTyping = (chatId) => {
    if (socket && user) {
      socket.emit('typing', { room: chatId, user });
    }
  };

  const emitStopTyping = (chatId) => {
    if (socket && user) {
      socket.emit('stop_typing', { room: chatId, user });
    }
  };

  const emitNewMessage = (message) => {
    if (socket) {
      socket.emit('new_message', message);
    }
  };

  const emitGroupUpdated = (chat) => {
    if (socket) {
      socket.emit('group_updated', chat);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        socketConnected,
        onlineUsers,
        typingUsers,
        joinChatRoom,
        leaveChatRoom,
        emitTyping,
        emitStopTyping,
        emitNewMessage,
        emitGroupUpdated,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
