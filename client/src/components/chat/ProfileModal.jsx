import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, X, Check, Sparkles } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const avatarSeeds = ['Felix', 'Daisy', 'Jack', 'Chloe', 'Oliver', 'Mia', 'Lucas', 'Zoe'];

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');

    const res = await updateUserProfile({ name, bio, avatar });
    setLoading(false);
    if (res.success) {
      setStatusMsg('Profile updated successfully!');
      setTimeout(() => {
        setStatusMsg('');
        onClose();
      }, 1000);
    } else {
      setStatusMsg(res.message || 'Update failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Your Profile</h2>
              <p className="text-xs text-slate-400">Manage account information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-brand-500/20 border border-brand-500/40 text-brand-300 text-xs text-center">
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="mt-4 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <img
              src={avatar}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover bg-slate-800 ring-4 ring-brand-500/40 shadow-lg"
            />
            <span className="text-xs text-slate-400 font-mono">@{user.username}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Choose Avatar
            </label>
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
              {avatarSeeds.map((seed) => {
                const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                const isSelected = avatar === url;
                return (
                  <img
                    key={seed}
                    src={url}
                    alt={seed}
                    onClick={() => setAvatar(url)}
                    className={`w-9 h-9 rounded-full cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-brand-500 scale-110'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              About / Bio
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What are you working on?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium shadow-md shadow-brand-600/30"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
