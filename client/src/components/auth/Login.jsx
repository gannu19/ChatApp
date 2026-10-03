import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Lock, User, ArrowRight, Sparkles } from 'lucide-react';

const Login = ({ onSwitchToRegister }) => {
  const { login, loading, error, setError } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId.trim() || !password) {
      setError('Please enter your email or username and password');
      return;
    }
    await login(loginId, password);
  };

  const handleQuickLogin = async (username) => {
    setLoginId(username);
    setPassword('password123');
    await login(username, 'password123');
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl glass-panel shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/30 mb-4">
          <MessageSquare className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Welcome to ChatApp</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time messaging platform</p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Email or Username
          </label>
          <div className="relative">
            <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="e.g. alice or alice@example.com"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500 transition-all text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500 transition-all text-sm"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium shadow-lg shadow-brand-600/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Demo Accounts Quick Login */}
      <div className="mt-6 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Instant Demo Logins
          </span>
          <span className="text-[10px] text-slate-500">(password123)</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Alice', user: 'alice', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20' },
            { name: 'Bob', user: 'bob', color: 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20' },
            { name: 'Charlie', user: 'charlie', color: 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20' },
            { name: 'Diana', user: 'diana', color: 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' },
          ].map((item) => (
            <button
              key={item.user}
              type="button"
              onClick={() => handleQuickLogin(item.user)}
              className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-left flex items-center justify-between ${item.color}`}
            >
              <span>{item.name}</span>
              <span className="text-[10px] opacity-70">@{item.user}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
        >
          Create account
        </button>
      </div>
    </div>
  );
};

export default Login;
