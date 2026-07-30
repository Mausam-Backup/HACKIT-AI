'use client';

import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface VapiVisualizerProps {
  isSpeaking: boolean;
  isThinking: boolean;
  volumeLevel: number;
}

export const VapiVisualizer: React.FC<VapiVisualizerProps> = ({
  isSpeaking,
  isThinking,
  volumeLevel
}) => {
  const bars = [0.4, 0.65, 0.9, 1.0, 0.75, 0.55, 0.85, 0.45, 0.7, 0.5, 0.9, 0.6];

  return (
    <div className="relative rounded-2xl bg-white border border-gray-200 overflow-hidden p-6 flex flex-col items-center justify-center gap-5 shrink-0" style={{ minHeight: '200px' }}>

      {/* Ambient glow */}
      <div className={`absolute inset-0 transition-all duration-700 ${
        isSpeaking
          ? 'bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.15)_0%,transparent_70%)]'
          : isThinking
          ? 'bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.1)_0%,transparent_70%)]'
          : 'opacity-0'
      }`} />

      {/* Avatar */}
      <div className="relative z-10 flex items-center justify-center">
        {isSpeaking && (
          <>
            <div className="absolute w-20 h-20 rounded-full border border-violet-500/30 animate-ping" style={{ animationDuration: '1.5s' }} />
            <div className="absolute w-28 h-28 rounded-full border border-indigo-500/20 animate-ping" style={{ animationDuration: '2s' }} />
          </>
        )}
        <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
          isSpeaking
            ? 'bg-gradient-to-br from-violet-600 to-indigo-700 shadow-[0_0_28px_rgba(124,58,237,0.55)]'
            : isThinking
            ? 'bg-gradient-to-br from-pink-600 to-violet-600 shadow-[0_0_20px_rgba(236,72,153,0.4)]'
            : 'bg-gray-100 border border-gray-200'
        }`}>
          {isThinking
            ? <Sparkles className="w-7 h-7 text-pink-200 animate-pulse" />
            : <Bot className={`w-7 h-7 ${isSpeaking ? 'text-white' : 'text-slate-500'}`} />
          }
        </div>
      </div>

      {/* Waveform bars */}
      <div className="relative z-10 flex items-center justify-center gap-[3px] h-8 w-full max-w-[180px]">
        {bars.map((multiplier, idx) => {
          const active = isSpeaking || isThinking;
          const h = active
            ? Math.max(14, Math.min(100, (volumeLevel || 0.5) * 100 * multiplier))
            : 12;
          return (
            <div
              key={idx}
              className={`flex-1 rounded-full transition-all duration-100 ${
                isSpeaking
                  ? 'bg-gradient-to-t from-violet-500 to-indigo-300'
                  : isThinking
                  ? 'bg-pink-400/70'
                  : 'bg-gray-200'
              }`}
              style={{ height: `${h}%` }}
            />
          );
        })}
      </div>

      {/* Status */}
      <div className="relative z-10 text-center">
        <p className={`text-sm font-semibold ${
          isSpeaking ? 'text-violet-600' : isThinking ? 'text-pink-600' : 'text-slate-700'
        }`}>
          {isSpeaking ? 'AI Speaking' : isThinking ? 'Processing…' : 'Listening'}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          {isSpeaking ? 'Listen closely and respond when ready' : 'Speak naturally into your mic'}
        </p>
      </div>
    </div>
  );
};
