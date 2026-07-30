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
  
  // Dragging state
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = React.useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

  if (!isOpen) return null;

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only initiate drag if clicking the header itself (not the buttons)
    if ((e.target as HTMLElement).closest("button")) return;
    
    setIsDragging(true);
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: offset.x,
      startY: offset.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.mouseX;
    const dy = e.clientY - dragStart.current.mouseY;
    setOffset({
      x: dragStart.current.startX + dx,
      y: dragStart.current.startY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div 
      className={`absolute left-6 bottom-20 z-40 w-[480px] bg-white text-zinc-800 rounded-2xl border border-zinc-200 overflow-hidden font-mono text-xs select-none transition-shadow ${isDragging ? "shadow-2xl shadow-slate-900/10 ring-2 ring-cyan-400/30" : "shadow-xl shadow-slate-900/5 animate-in fade-in slide-in-from-bottom-4 duration-200"}`}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      {/* Console Header (Drag Handle) */}
      <div 
        className={`px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between font-sans ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
            <Terminal className="size-4" />
          </div>
          <span className="text-xs font-bold text-zinc-900">Execution Logs Console</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-200 text-[10px] text-zinc-600 font-mono">
            {logs.length} events
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors"
            title="Copy Logs"
          >
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
          </button>
          <button
            onClick={onClearLogs}
            className="p-1 text-zinc-400 hover:text-red-600 transition-colors"
            title="Clear Logs"
          >
            <Trash2 className="size-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2 bg-zinc-50/50 border-b border-zinc-200 flex items-center gap-3 text-[11px] font-sans text-zinc-500">
        <span className="flex items-center gap-1 font-medium">
          <Filter className="size-3 text-zinc-400" /> Filter:
        </span>
        {["all", "system", "agent"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`capitalize font-medium ${filter === f ? "text-zinc-900 font-bold" : "hover:text-zinc-800"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Logs Output */}
      <div className="p-4 max-h-64 overflow-auto space-y-1.5 leading-relaxed bg-white">
        {logs.length === 0 ? (
          <p className="text-zinc-400 italic">No execution logs yet. Click &quot;Test Pipeline&quot; to run.</p>
        ) : (
          logs.map((log, index) => {
            const isSuccess = log.includes("Finalized") || log.includes("Complete");
            const isInfo = log.includes("Initializing") || log.includes("Parsing");
            return (
              <div key={index} className="flex items-start gap-2">
                <span className="text-zinc-300 select-none">&gt;</span>
                <p className={`${isSuccess ? "text-emerald-600 font-bold" : isInfo ? "text-zinc-900" : "text-zinc-700"}`}>
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
