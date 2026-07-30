'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  commands: {
    npm: string;
    pnpm: string;
    yarn: string;
    bun: string;
  };
}

export default function CodeBlock({ commands }: CodeBlockProps) {
  const [activeTab, setActiveTab] = useState<keyof typeof commands>('npm');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(commands[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: Array<keyof typeof commands> = ['npm', 'pnpm', 'yarn', 'bun'];

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 overflow-hidden my-6">
      {/* Tabs */}
      <div className="flex items-center px-4 pt-3 gap-6 border-b border-zinc-200/50">
        <div className="flex items-center justify-center w-6 h-6 rounded bg-zinc-900 text-white shrink-0 mr-2">
          <span className="text-[10px] font-mono leading-none">&gt;_</span>
        </div>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === tab ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-t-full" />
            )}
          </button>
        ))}
        <div className="flex-1" />
        <button 
          onClick={handleCopy}
          className="pb-3 text-zinc-400 hover:text-zinc-900 transition-colors"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      
      {/* Code Area */}
      <div className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-zinc-800">
          <span className="text-sky-500 mr-2">npx</span>
          {commands[activeTab].replace('npx ', '')}
        </code>
      </div>
    </div>
  );
}
