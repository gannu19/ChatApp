import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Users } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';

const ChatListItem = ({ chat, isSelected, onClick, unreadCount = 0 }) => {
  const { user } = useAuth();
  const { onlineUsers, typingUsers } = useSocket();

  // For 1-on-1 chats, identify the other participant
  const otherUser = !chat.isGroupChat
    ? chat.users?.find((u) => u._id !== user._id)
    : null;

  const chatName = chat.isGroupChat
    ? chat.chatName
    : otherUser?.name || 'Direct Chat';

  const avatar = chat.isGroupChat
    ? chat.groupAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${chat._id}`
    : otherUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?._id}`;

  const isOnline = !chat.isGroupChat && otherUser && onlineUsers.includes(otherUser._id);
  const typingList = typingUsers[chat._id] || [];
  const isTyping = typingList.length > 0;

  // Format timestamp of latest message or chat updated time
  let timeString = '';
  if (chat.latestMessage?.createdAt || chat.updatedAt) {
    try {
      const date = new Date(chat.latestMessage?.createdAt || chat.updatedAt);
      timeString = formatDistanceToNowStrict(date, { addSuffix: false });
    } catch (e) {
      timeString = '';
    }
  }

  // Format snippet of latest message
  let latestSnippet = 'No messages yet';
  if (isTyping) {
    latestSnippet = `${typingList.join(', ')} is typing...`;
  } else if (chat.latestMessage) {
    const senderName = chat.latestMessage.sender?._id === user._id ? 'You' : (chat.latestMessage.sender?.name?.split(' ')[0] || 'User');
    latestSnippet = `${senderName}: ${chat.latestMessage.content}`;
  }

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-3.5 p-3 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? 'bg-brand-600/20 border border-brand-500/40 text-white shadow-md'
          : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
      }`}
    >
      {/* Avatar & Online Indicator */}
      <div className="relative flex-shrink-0">
        <img
          src={avatar}
          alt={chatName}
          className="w-12 h-12 rounded-full object-cover bg-slate-800 ring-2 ring-slate-700/50"
        />
        {chat.isGroupChat ? (
          <span className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full p-0.5 text-brand-400 ring-1 ring-slate-700">
            <Users className="w-3.5 h-3.5" />
          </span>
        ) : (
          <span
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
              isOnline ? 'bg-emerald-500' : 'bg-slate-500'
            }`}
          />
        )}
      </div>

      {/* Info & Snippet */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <h3 className="text-sm font-semibold truncate text-slate-100 group-hover:text-white">
            {chatName}
          </h3>
          {timeString && (
            <span className="text-[11px] font-medium text-slate-400 flex-shrink-0">
              {timeString}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-xs truncate ${
              isTyping
                ? 'text-brand-400 font-medium italic animate-pulse'
                : unreadCount > 0
                ? 'text-slate-100 font-semibold'
                : 'text-slate-400'
            }`}
          >
            {latestSnippet}
          </p>

          {unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-brand-500 text-white text-[11px] font-bold shadow-sm animate-pulse-subtle">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
