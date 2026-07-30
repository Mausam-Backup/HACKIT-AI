'use client';

import React, { useEffect, useRef } from 'react';
import { Bot, User, MessageSquare } from 'lucide-react';

interface Message {
  role?: string;
  transcript?: string;
  content?: string;
  message?: string;
  type?: string;
}

interface TranscriptionDisplayProps {
  messages: Message[];
  lastTranscript?: string;
}

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  messages,
  lastTranscript
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, lastTranscript]);

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Transcript</span>
        </div>
        <span className="text-[9px] font-bold tracking-widest uppercase text-violet-700 border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 rounded-full">
          Live STT
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
        {messages.length === 0 && !lastTranscript ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-10">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 max-w-[180px] leading-relaxed">
              Transcript appears here as you speak
            </p>
          </div>
        ) : null}

        {messages.map((msg, index) => {
          const isUser = msg.role === 'user' || msg.type === 'user-transcript';
          const text = msg.transcript || msg.content || msg.message;
          if (!text) return null;

          return (
            <div key={index} className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 border ${
                isUser
                  ? 'bg-violet-100 border-violet-200'
                  : 'bg-gray-100 border-gray-200'
              }`}>
                {isUser
                  ? <User className="w-3 h-3 text-violet-600" />
                  : <Bot className="w-3 h-3 text-slate-500" />
                }
              </div>

              {/* Bubble */}
              <div className={`max-w-[78%] px-3.5 py-2.5 text-xs leading-relaxed rounded-2xl ${
                isUser
                  ? 'bg-violet-100 border border-violet-200 text-violet-900 rounded-br-sm'
                  : 'bg-gray-50 border border-gray-200 text-slate-700 rounded-bl-sm'
              }`}>
                {text}
              </div>
            </div>
          );
        })}

        {/* Live partial */}
        {lastTranscript && (
          <div className="flex items-end gap-2.5 flex-row-reverse opacity-70">
            <div className="w-6 h-6 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0">
              <User className="w-3 h-3 text-violet-600" />
            </div>
            <div className="max-w-[78%] px-3.5 py-2.5 text-xs italic bg-violet-50 border border-violet-200 text-violet-900 rounded-2xl rounded-br-sm">
              {lastTranscript}
              <span className="inline-flex gap-0.5 ml-1.5 align-middle">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="w-1 h-1 rounded-full bg-violet-400 animate-bounce inline-block" style={{ animationDelay: `${d}ms` }} />
                ))}
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
