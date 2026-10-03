import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import GroupInfoModal from './GroupInfoModal';
import {
  Users,
  Info,
  MoreVertical,
  MessageSquare,
  Shield,
  Sparkles,
  Search,
} from 'lucide-react';

const ChatArea = () => {
  const { user } = useAuth();
  const { selectedChat, messages, loadingMessages, sendMessage } = useChat();
  const { onlineUsers, typingUsers } = useSocket();

  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, typingUsers]);

  if (!selectedChat) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center p-8 bg-slate-950 text-center relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute w-96 h-96 bg-brand-600/10 rounded-full blur-3xl -top-20 -right-20 pointer-events-none" />
        <div className="absolute w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -bottom-20 -left-20 pointer-events-none" />

        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xl mb-6 relative">
          <MessageSquare className="w-10 h-10 text-brand-400" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Real-Time Messaging</h2>
        <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-6">
          Select an existing conversation from the sidebar or click <span className="text-brand-400 font-semibold">Find People</span> to initiate a new direct chat or group room.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl w-full text-left text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-brand-400 font-bold block mb-1">⚡ Instant Delivery</span>
            <p className="text-slate-400">Low-latency Socket.IO event architecture for instantaneous chat.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-indigo-400 font-bold block mb-1">👥 Group Rooms</span>
            <p className="text-slate-400">Team channels with admin controls and member management.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-emerald-400 font-bold block mb-1">🔍 Indexed Speed</span>
            <p className="text-slate-400">MongoDB compound indexes for rapid conversation history retrieval.</p>
          </div>
        </div>
      </div>
    );
  }

  // Active chat details
  const otherUser = !selectedChat.isGroupChat
    ? selectedChat.users?.find((u) => u._id !== user._id)
    : null;

  const chatTitle = selectedChat.isGroupChat
    ? selectedChat.chatName
    : otherUser?.name || 'Direct Chat';

  const avatar = selectedChat.isGroupChat
    ? selectedChat.groupAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedChat._id}`
    : otherUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?._id}`;

  const isOnline = !selectedChat.isGroupChat && otherUser && onlineUsers.includes(otherUser._id);
  const typingList = typingUsers[selectedChat._id] || [];

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-950 overflow-hidden relative">
      {/* Header */}
      <div className="h-16 px-6 glass-panel border-b border-slate-800 flex items-center justify-between flex-shrink-0 z-10">
        <div
          onClick={() => selectedChat.isGroupChat && setIsGroupInfoOpen(true)}
          className={`flex items-center gap-3.5 ${
            selectedChat.isGroupChat ? 'cursor-pointer group' : ''
          }`}
        >
          <div className="relative">
            <img
              src={avatar}
              alt={chatTitle}
              className="w-10 h-10 rounded-full object-cover bg-slate-800 ring-2 ring-slate-700/60"
            />
            {!selectedChat.isGroupChat && (
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${
                  isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              />
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors flex items-center gap-2">
              {chatTitle}
              {selectedChat.isGroupChat && (
                <span className="text-[11px] font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  {selectedChat.users?.length} members
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              {selectedChat.isGroupChat
                ? selectedChat.groupDescription || 'Click for group info'
                : isOnline
                ? 'Online'
                : 'Offline'}
            </p>
          </div>
        </div>

        {/* Right header actions */}
        <div className="flex items-center gap-2">
          {selectedChat.isGroupChat && (
            <button
              onClick={() => setIsGroupInfoOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Group Details & Members"
            >
              <Info className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1">
        {loadingMessages ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading message history...</span>
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg, index) => {
            const prevMsg = index > 0 ? messages[index - 1] : null;
            return (
              <MessageBubble
                key={msg._id || index}
                message={msg}
                isGroupChat={selectedChat.isGroupChat}
                previousMessage={prevMsg}
              />
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No messages yet</p>
            <p className="text-slate-500 mt-1">Send a message to break the ice!</p>
          </div>
        )}

        {/* Real-time typing bubble */}
        {typingList.length > 0 && (
          <div className="flex items-center gap-2 pt-2 text-xs text-brand-400 italic">
            <div className="flex items-center gap-1 bg-slate-900/90 px-3 py-1.5 rounded-full border border-brand-500/20 shadow-sm">
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1.5 font-medium not-italic text-slate-300">
                {typingList.join(', ')} {typingList.length === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <MessageInput
        chatId={selectedChat._id}
        onSendMessage={sendMessage}
      />

      {/* Group Info Modal */}
      {selectedChat.isGroupChat && (
        <GroupInfoModal
          isOpen={isGroupInfoOpen}
          onClose={() => setIsGroupInfoOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatArea;
