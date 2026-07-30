"use client";

import React, { useState } from "react";
import { Terminal, X, Trash2, Copy, Check, Filter } from "lucide-react";

interface ExecutionLogsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: string[];
  onClearLogs: () => void;
}

export default function ExecutionLogsDrawer({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}: ExecutionLogsDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState("all");

  if (!isOpen) return null;

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute left-6 bottom-20 z-40 w-[480px] bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-mono text-xs animate-in fade-in slide-in-from-bottom-4 duration-200 select-none">
      {/* Console Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-sans">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
            <Terminal className="size-4" />
          </div>
          <span className="text-xs font-bold text-slate-900">Execution Logs Console</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-[10px] text-slate-600 font-mono">
            {logs.length} events
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
            title="Copy Logs"
          >
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
          </button>
          <button
            onClick={onClearLogs}
            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
            title="Clear Logs"
          >
            <Trash2 className="size-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-200 flex items-center gap-3 text-[11px] font-sans text-slate-500">
        <span className="flex items-center gap-1 font-medium">
          <Filter className="size-3 text-slate-400" /> Filter:
        </span>
        {["all", "system", "agent"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`capitalize font-medium ${filter === f ? "text-blue-600 font-bold" : "hover:text-slate-800"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Logs Output */}
      <div className="p-4 max-h-64 overflow-auto space-y-1.5 leading-relaxed bg-white">
        {logs.length === 0 ? (
          <p className="text-slate-400 italic">No execution logs yet. Click &quot;Test Pipeline&quot; to run.</p>
        ) : (
          logs.map((log, index) => {
            const isSuccess = log.includes("Finalized") || log.includes("Complete");
            const isInfo = log.includes("Initializing") || log.includes("Parsing");
            return (
              <div key={index} className="flex items-start gap-2">
                <span className="text-slate-300 select-none">&gt;</span>
                <p className={`${isSuccess ? "text-emerald-600 font-bold" : isInfo ? "text-blue-600" : "text-slate-700"}`}>
                  {log}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
