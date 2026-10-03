import React, { useState, useEffect } from 'react';
import { searchUsers, createGroup } from '../../services/api';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { Users, X, Search, Check, Plus } from 'lucide-react';

const GroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setChats, setSelectedChat } = useChat();
  const { emitGroupUpdated } = useSocket();

  useEffect(() => {
    if (!isOpen) {
      setGroupName('');
      setDescription('');
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUsers([]);
      setError('');
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await searchUsers(searchQuery);
        setSearchResults(res.data);
      } catch (err) {
        console.error('Failed to search users:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  const handleToggleUser = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Please provide a group name');
      return;
    }
    if (selectedUsers.length < 2) {
      setError('Please select at least 2 members for the group');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await createGroup({
        name: groupName.trim(),
        description: description.trim(),
        users: selectedUsers.map((u) => u._id),
      });

      const newGroup = res.data;
      setChats((prev) => [newGroup, ...prev]);
      setSelectedChat(newGroup);
      emitGroupUpdated(newGroup);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl glass-panel border border-slate-700 shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create New Group</h2>
              <p className="text-xs text-slate-400">Collaborate with multiple teammates</p>
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
          <div className="mt-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateGroup} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Group Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Frontend Engineering Team"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Group Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional purpose of this group..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm"
            />
          </div>

          {/* Selected badges */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Selected Members ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {selectedUsers.map((u) => (
                  <span
                    key={u._id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-300 text-xs font-medium"
                  >
                    <span>{u.name}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleUser(u)}
                      className="hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add Members Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Add Members (Pick at least 2)
            </label>
            <div className="relative mb-2">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates by name/username..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-xs"
              />
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {searchResults.map((u) => {
                const isSelected = selectedUsers.some((sel) => sel._id === u._id);
                return (
                  <div
                    key={u._id}
                    onClick={() => handleToggleUser(u)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-brand-600/20 border border-brand-500/40'
                        : 'bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u._id}`}
                        alt={u.name}
                        className="w-7 h-7 rounded-full bg-slate-800 object-cover"
                      />
                      <div>
                        <p className="text-xs font-semibold text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-400">@{u.username}</p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-brand-600 border-brand-500 text-white'
                          : 'border-slate-700 bg-slate-800 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedUsers.length < 2 || !groupName.trim()}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium shadow-md shadow-brand-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupModal;
