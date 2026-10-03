import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Sidebar from './components/chat/Sidebar';
import ChatArea from './components/chat/ChatArea';

function App() {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
        {/* Subtle decorative background gradients */}
        <div className="absolute w-[500px] h-[500px] bg-brand-600/15 rounded-full blur-[120px] -top-32 -left-32 pointer-events-none" />
        <div className="absolute w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] -bottom-32 -right-32 pointer-events-none" />

        {authMode === 'login' ? (
          <Login onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar with active chats, search, groups */}
      <Sidebar />

      {/* Main chat messaging viewport */}
      <ChatArea />
    </div>
  );
}

export default App;
