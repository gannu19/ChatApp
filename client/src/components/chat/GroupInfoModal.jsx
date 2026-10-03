import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { renameGroup, addGroupMember, removeGroupMember, leaveGroup, searchUsers } from '../../services/api';
import { Users, X, UserMinus, UserPlus, LogOut, Edit3, Shield, Check } from 'lucide-react';

const GroupInfoModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { selectedChat, setSelectedChat, loadChats } = useChat();
  const { emitGroupUpdated } = useSocket();

  const [isEditing, setIsEditing] = useState(false);
  const [chatName, setChatName] = useState(selectedChat?.chatName || '');
  const [description, setDescription] = useState(selectedChat?.groupDescription || '');
  const [searchCandidate, setSearchCandidate] = useState('');
  const [candidateResults, setCandidateResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !selectedChat || !selectedChat.isGroupChat) return null;

  const isAdmin = selectedChat.groupAdmin?._id === user._id;

  const handleUpdateGroupInfo = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await renameGroup(selectedChat._id, { name: chatName, description });
      setSelectedChat(res.data);
      emitGroupUpdated(res.data);
      loadChats();
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update group');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCandidates = async (q) => {
    setSearchCandidate(q);
    if (!q.trim()) {
      setCandidateResults([]);
      return;
    }
    try {
      const res = await searchUsers(q);
      // Filter out users already in this group
      const existingUserIds = selectedChat.users.map((u) => u._id);
      const filtered = res.data.filter((u) => !existingUserIds.includes(u._id));
      setCandidateResults(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      setLoading(true);
      const res = await addGroupMember(selectedChat._id, userId);
      setSelectedChat(res.data);
      emitGroupUpdated(res.data);
      loadChats();
      setSearchCandidate('');
      setCandidateResults([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      setLoading(true);
      const res = await removeGroupMember(selectedChat._id, userId);
      setSelectedChat(res.data);
      emitGroupUpdated(res.data);
      loadChats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    try {
      setLoading(true);
      await leaveGroup(selectedChat._id);
      setSelectedChat(null);
      loadChats();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl glass-panel border border-slate-700 shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={selectedChat.groupAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedChat._id}`}
              alt={selectedChat.chatName}
              className="w-12 h-12 rounded-xl object-cover bg-slate-800 ring-2 ring-brand-500/30"
            />
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {selectedChat.chatName}
                {isAdmin && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </h2>
              <p className="text-xs text-slate-400">{selectedChat.users?.length} members</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        {/* Edit Form */}
        {isEditing ? (
          <form onSubmit={handleUpdateGroupInfo} className="mt-4 space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Group Name
              </label>
              <input
                type="text"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-3 text-xs text-slate-300 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
            <span className="font-semibold text-slate-400">Description: </span>
            {selectedChat.groupDescription || 'No description provided.'}
          </div>
        )}

        {/* Member Management */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Members ({selectedChat.users?.length})
            </h3>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {selectedChat.users?.map((u) => {
              const isGroupAdmin = selectedChat.groupAdmin?._id === u._id;
              const isCurrentUser = u._id === user._id;

              return (
                <div
                  key={u._id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u._id}`}
                      alt={u.name}
                      className="w-8 h-8 rounded-full bg-slate-800 object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {u.name} {isCurrentUser && '(You)'}
                        </span>
                        {isGroupAdmin && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <Shield className="w-2.5 h-2.5" /> Admin
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">@{u.username}</span>
                    </div>
                  </div>

                  {isAdmin && !isGroupAdmin && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(u._id)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      title="Remove Member"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Member section for Admin */}
        {isAdmin && (
          <div className="mt-4 pt-3 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Add New Teammate
            </label>
            <input
              type="text"
              value={searchCandidate}
              onChange={(e) => handleSearchCandidates(e.target.value)}
              placeholder="Search user to add..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />

            {candidateResults.length > 0 && (
              <div className="mt-2 max-h-28 overflow-y-auto space-y-1">
                {candidateResults.map((cand) => (
                  <div
                    key={cand._id}
                    onClick={() => handleAddMember(cand._id)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 cursor-pointer text-xs"
                  >
                    <span>{cand.name} (@{cand.username})</span>
                    <UserPlus className="w-3.5 h-3.5 text-brand-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Leave Group Action */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={handleLeaveGroup}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave Group</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;
