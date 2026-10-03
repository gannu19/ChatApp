import React, { useState, useEffect } from 'react';
import { searchUsers } from '../../services/api';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { Search, X, UserPlus, Sparkles, MessageCircle } from 'lucide-react';

const UserSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { selectOrCreateDirectChat } = useChat();
  const { onlineUsers } = useSocket();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchUsers(query);
        setResults(res.data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const handleSelectUser = async (userId) => {
    await selectOrCreateDirectChat(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Find People</h2>
              <p className="text-xs text-slate-400">Search users by name, username or email</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mt-4">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type name, @username, or email..."
            autoFocus
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm"
          />
        </div>

        {/* Results List */}
        <div className="mt-4 max-h-72 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Searching directory...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((u) => {
              const isOnline = onlineUsers.includes(u._id);
              return (
                <div
                  key={u._id}
                  onClick={() => handleSelectUser(u._id)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-brand-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u._id}`}
                        alt={u.name}
                        className="w-10 h-10 rounded-full bg-slate-800 object-cover"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                          isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                        {u.name}
                      </h4>
                      <p className="text-xs text-slate-400">@{u.username}</p>
                    </div>
                  </div>

                  <button className="p-2 rounded-lg bg-slate-800 group-hover:bg-brand-600 text-slate-300 group-hover:text-white transition-all shadow-sm">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              {query ? 'No users matching your search.' : 'Type a keyword to discover registered users.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
