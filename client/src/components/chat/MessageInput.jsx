import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Send, Smile, Paperclip } from 'lucide-react';

const COMMON_EMOJIS = ['👍', '❤️', '🔥', '🎉', '🚀', '😄', '✨', '👏', '👀', '💯'];

const MessageInput = ({ onSendMessage, chatId }) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { emitTyping, emitStopTyping } = useSocket();
  const typingTimerRef = useRef(null);
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    setText(e.target.value);

    // Emit typing indicator
    emitTyping(chatId);

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      emitStopTyping(chatId);
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    emitStopTyping(chatId);

    onSendMessage(text);
    setText('');
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const addEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative p-3.5 bg-slate-950/90 border-t border-slate-800/80">
      {/* Emoji Popup Bar */}
      {showEmojiPicker && (
        <div className="absolute bottom-full left-4 mb-2 p-2 rounded-2xl glass-panel border border-slate-700 shadow-2xl flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150 z-20">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 hover:scale-125 transition-all text-base"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-5xl mx-auto">
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`p-2 rounded-xl transition-colors ${
            showEmojiPicker
              ? 'text-brand-400 bg-brand-500/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Insert Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Press Enter to send)"
            className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm transition-all"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium shadow-md shadow-brand-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
