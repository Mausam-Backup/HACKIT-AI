'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  commands: Record<string, string>;
}

export default function CodeBlock({ commands }: CodeBlockProps) {
  const tabs = Object.keys(commands);
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);
  const [copied, setCopied] = useState(false);

  // If the active tab somehow gets out of sync, fallback to the first tab
  const currentCommand = commands[activeTab] || commands[tabs[0]];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 overflow-hidden my-6">
      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex items-center px-4 pt-3 gap-6 border-b border-zinc-200/50">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-zinc-900 text-white shrink-0 mr-2">
            <span className="text-[10px] font-mono leading-none">&gt;_</span>
          </div>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors relative capitalize ${
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
      )}
      
      {/* If no tabs shown, we still need a header bar for copy button */}
      {tabs.length === 1 && (
        <div className="flex items-center px-4 pt-3 pb-3 gap-6 border-b border-zinc-200/50">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-zinc-900 text-white shrink-0 mr-2">
            <span className="text-[10px] font-mono leading-none">&gt;_</span>
          </div>
          <span className="text-sm font-medium text-zinc-900 capitalize">{tabs[0]}</span>
          <div className="flex-1" />
          <button 
            onClick={handleCopy}
            className="text-zinc-400 hover:text-zinc-900 transition-colors"
            aria-label="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
      
      {/* Code Area */}
      <div className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-zinc-800">
          {currentCommand}
        </code>
      </div>
    </div>
  );
}
