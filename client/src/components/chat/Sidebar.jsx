import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import ChatListItem from './ChatListItem';
import UserSearchModal from './UserSearchModal';
import GroupModal from './GroupModal';
import ProfileModal from './ProfileModal';
import {
  MessageSquare,
  Search,
  UserPlus,
  Users,
  Settings,
  LogOut,
  Sparkles,
  Circle,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { chats, selectedChat, setSelectedChat, notifications, loadingChats } = useChat();
  const { socketConnected } = useSocket();

  const [filterText, setFilterText] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Filter conversations by search term
  const filteredChats = chats.filter((chat) => {
    if (!filterText.trim()) return true;
    const nameToMatch = chat.isGroupChat
      ? chat.chatName
      : chat.users?.find((u) => u._id !== user._id)?.name || '';
    return nameToMatch.toLowerCase().includes(filterText.toLowerCase());
  });

  return (
    <div className="w-80 md:w-96 h-full flex flex-col glass-panel border-r border-slate-800/80 bg-slate-950/95 flex-shrink-0">
      {/* Top Bar / Profile Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-3 cursor-pointer group"
          title="Click to edit profile"
        >
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover bg-slate-800 ring-2 ring-brand-500/40 group-hover:ring-brand-400 transition-all"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${
                socketConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors truncate">
              {user.name}
            </h2>
            <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
          </div>
        </div>

        {/* Quick Action Icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Find People"
          >
            <UserPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsGroupOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Create Group Chat"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsProfileOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Profile Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3 border-b border-slate-800/60">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loadingChats ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500 text-xs">
            <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading conversations...</span>
          </div>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => {
            const isSelected = selectedChat?._id === chat._id;
            const chatNotifications = notifications.filter((n) => n.chat._id === chat._id);

            return (
              <ChatListItem
                key={chat._id}
                chat={chat}
                isSelected={isSelected}
                unreadCount={chatNotifications.length}
                onClick={() => setSelectedChat(chat)}
              />
            );
          })
        ) : (
          <div className="text-center py-12 px-4 text-slate-500 text-xs">
            {filterText ? (
              'No conversations match your search.'
            ) : (
              <div className="space-y-3">
                <p>No active conversations yet.</p>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600/20 text-brand-300 hover:bg-brand-600/30 text-xs font-medium border border-brand-500/30 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Start a Chat</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <UserSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <GroupModal isOpen={isGroupOpen} onClose={() => setIsGroupOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};

export default Sidebar;
