"use client";

import React from "react";
import { X, Wrench, FileCode, Database, Bot, Video, Presentation, Plus } from "lucide-react";

interface ToolsLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolNode: { title: string; type: string; status: string }) => void;
}

export default function ToolsLibraryDrawer({
  isOpen,
  onClose,
  onSelectTool,
}: ToolsLibraryDrawerProps) {
  if (!isOpen) return null;

  const toolsList = [
    {
      id: "liteparse",
      title: "LiteParse Document Engine",
      type: "queue",
      status: "ready",
      desc: "Fast document parsing & score-based chunking",
      icon: FileCode,
      tag: "Parsing",
    },
    {
      id: "mem0",
      title: "Mem0 Vector Memory",
      type: "live",
      status: "live",
      desc: "Persistent FastEmbed vector store & session memory",
      icon: Database,
      tag: "Memory",
    },
    {
      id: "mcp",
      title: "FastMCP Context Server",
      type: "trigger",
      status: "active",
      desc: "Expose API endpoints to AI agent tool-calls",
      icon: Bot,
      tag: "Context Protocol",
    },
    {
      id: "interview",
      title: "AI Pitch Simulator",
      type: "review",
      status: "warning",
      desc: "Real-time audio/video judge feedback loop",
      icon: Video,
      tag: "Interviews",
    },
    {
      id: "synthesizer",
      title: "Pitch Deck Synthesizer",
      type: "success",
      status: "success",
      desc: "Automated PPTX, PDF, and SSE streaming exports",
      icon: Presentation,
      tag: "Presentations",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl border-l border-zinc-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-zinc-100 text-zinc-900">
              <Wrench className="size-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900">HAC-KIT Backend Tools</h3>
              <p className="text-[10px] text-zinc-400">Click any tool to add to canvas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tools List */}
        <div className="p-4 flex-1 overflow-auto space-y-3">
          {toolsList.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => {
                  onSelectTool({
                    title: tool.title,
                    type: tool.type,
                    status: tool.status,
                  });
                  onClose();
                }}
                className="p-3 rounded-2xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-100/30 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors text-zinc-600">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 group-hover:text-blue-700 transition-colors">
                        {tool.title}
                      </h4>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                        {tool.tag}
                      </span>
                    </div>
                  </div>
                  <Plus className="size-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                </div>
                <p className="text-[11px] text-zinc-500 leading-snug mt-1">{tool.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
