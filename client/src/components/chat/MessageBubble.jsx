import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { Check, CheckCheck, Copy } from 'lucide-react';

const MessageBubble = ({ message, isGroupChat = false, previousMessage = null }) => {
  const { user } = useAuth();
  const isSender = message.sender?._id === user._id;

  // Check if same sender sent contiguous messages
  const isContiguous =
    previousMessage && previousMessage.sender?._id === message.sender?._id;

  let timeString = '';
  try {
    timeString = format(new Date(message.createdAt || Date.now()), 'p');
  } catch (e) {
    timeString = '';
  }

  const isRead = message.readBy && message.readBy.length > 1;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div
      className={`group flex flex-col ${
        isSender ? 'items-end' : 'items-start'
      } ${isContiguous ? 'mt-1' : 'mt-3.5'}`}
    >
      <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar for receiver in group chats */}
        {!isSender && (
          <div className="w-7 h-7 flex-shrink-0">
            {!isContiguous ? (
              <img
                src={message.sender?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender?._id}`}
                alt={message.sender?.name}
                className="w-7 h-7 rounded-full object-cover bg-slate-800"
                title={message.sender?.name}
              />
            ) : (
              <div className="w-7 h-7" />
            )}
          </div>
        )}

        {/* Bubble container */}
        <div
          className={`relative px-4 py-2.5 rounded-2xl break-words text-sm shadow-sm transition-all ${
            isSender
              ? 'chat-bubble-sender text-white rounded-br-xs'
              : 'chat-bubble-receiver text-slate-100 rounded-bl-xs'
          }`}
        >
          {/* Sender name for group chats */}
          {!isSender && !isContiguous && isGroupChat && (
            <p className="text-[11px] font-bold text-brand-300 mb-1">
              {message.sender?.name || 'User'}
            </p>
          )}

          <p className="whitespace-pre-wrap leading-relaxed text-sm selection:bg-white/20">
            {message.content}
          </p>

          <div
            className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
              isSender ? 'text-indigo-200/80' : 'text-slate-400'
            }`}
          >
            <span>{timeString}</span>
            {isSender && (
              <span>
                {isRead ? (
                  <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-indigo-300/70" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Copy button on hover */}
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          title="Copy message"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default MessageBubble;
