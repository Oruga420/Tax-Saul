import React from 'react';
import { Message } from '../types';
import { User, Bot, ExternalLink, Paperclip } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg 
          ${isUser 
            ? 'bg-slate-200 text-slate-600' 
            : 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white neon-blue-shadow'
          }`}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-6 py-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap
            ${isUser 
              ? 'bg-white border border-slate-200 text-slate-700 rounded-tr-none' 
              : 'bg-white border-l-4 border-l-fuchsia-500 text-slate-800 rounded-tl-none shadow-md'
            }`}>
            
            {/* Attachments Preview for User */}
            {isUser && message.attachments && message.attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2 justify-end">
                    {message.attachments.map((att, i) => (
                        <div key={i} className="flex items-center text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">
                            <Paperclip className="w-3 h-3 mr-1" />
                            {att.name}
                        </div>
                    ))}
                </div>
            )}

            {message.content}
          </div>

          {/* Grounding Sources (Citations) */}
          {!isUser && message.groundingSources && message.groundingSources.length > 0 && (
            <div className="mt-3 bg-white/50 p-3 rounded-lg border border-cyan-100 w-full animate-fade-in">
              <h4 className="text-xs font-bold text-cyan-600 uppercase tracking-wide mb-2 flex items-center">
                <ExternalLink className="w-3 h-3 mr-1" /> Verified Sources
              </h4>
              <ul className="space-y-1">
                {message.groundingSources.map((source, idx) => (
                  <li key={idx}>
                    <a 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 hover:text-fuchsia-600 hover:underline flex items-center transition-colors truncate"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 mr-2 flex-shrink-0"></span>
                      {source.title || source.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;