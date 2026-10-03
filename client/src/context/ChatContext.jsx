import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { fetchChats, fetchMessages, sendMessage as apiSendMessage, accessOrCreateChat } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket, joinChatRoom, leaveChatRoom, emitNewMessage } = useSocket();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const selectedChatRef = useRef(selectedChat);
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Load chats on user login
  const loadChats = async () => {
    if (!user) return;
    setLoadingChats(true);
    try {
      const res = await fetchChats();
      setChats(res.data);
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, [user]);

  // Load messages when selectedChat changes
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetchMessages(selectedChat._id);
        setMessages(res.data.messages || []);
        joinChatRoom(selectedChat._id);

        // Remove any existing notifications for this chat
        setNotifications((prev) => prev.filter((n) => n.chat._id !== selectedChat._id));
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();

    return () => {
      if (selectedChat) {
        leaveChatRoom(selectedChat._id);
      }
    };
  }, [selectedChat]);

  // Socket real-time message receiver
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMessage) => {
      const currentActive = selectedChatRef.current;
      if (currentActive && currentActive._id === newMessage.chat._id) {
        setMessages((prev) => [...prev, newMessage]);
      } else {
        // Chat is not active: add to unread notifications
        setNotifications((prev) => [newMessage, ...prev]);
      }

      // Update the latestMessage on corresponding chat in sidebar
      setChats((prevChats) =>
        prevChats.map((c) =>
          c._id === newMessage.chat._id
            ? { ...c, latestMessage: newMessage, updatedAt: new Date().toISOString() }
            : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    };

    const handleNotification = (newMessage) => {
      const currentActive = selectedChatRef.current;
      if (!currentActive || currentActive._id !== newMessage.chat._id) {
        setNotifications((prev) => {
          if (prev.some((n) => n._id === newMessage._id)) return prev;
          return [newMessage, ...prev];
        });
      }
      loadChats();
    };

    const handleChatListUpdated = () => {
      loadChats();
    };

    socket.on('message_received', handleMessageReceived);
    socket.on('notification_received', handleNotification);
    socket.on('chat_list_updated', handleChatListUpdated);
    socket.on('group_updated', handleChatListUpdated);

    return () => {
      socket.off('message_received', handleMessageReceived);
      socket.off('notification_received', handleNotification);
      socket.off('chat_list_updated', handleChatListUpdated);
      socket.off('group_updated', handleChatListUpdated);
    };
  }, [socket]);

  // Send a message
  const sendMessage = async (content) => {
    if (!content.trim() || !selectedChat) return;

    try {
      const res = await apiSendMessage({
        content,
        chatId: selectedChat._id,
      });

      setMessages((prev) => [...prev, res.data]);
      emitNewMessage(res.data);

      // Update sidebar chat list latest message
      setChats((prevChats) =>
        prevChats.map((c) =>
          c._id === selectedChat._id
            ? { ...c, latestMessage: res.data, updatedAt: new Date().toISOString() }
            : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );

      return res.data;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  // Start or open 1-on-1 chat with user
  const selectOrCreateDirectChat = async (targetUserId) => {
    try {
      const res = await accessOrCreateChat(targetUserId);
      const chat = res.data;
      if (!chats.find((c) => c._id === chat._id)) {
        setChats([chat, ...chats]);
      }
      setSelectedChat(chat);
      return chat;
    } catch (err) {
      console.error('Error creating/accessing chat:', err);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        messages,
        setMessages,
        loadingChats,
        loadingMessages,
        notifications,
        setNotifications,
        loadChats,
        sendMessage,
        selectOrCreateDirectChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
