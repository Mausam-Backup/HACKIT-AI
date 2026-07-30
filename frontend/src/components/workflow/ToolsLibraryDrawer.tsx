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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Wrench className="size-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">HAC-KIT Backend Tools</h3>
              <p className="text-[10px] text-slate-400">Click any tool to add to canvas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
                className="p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors text-slate-600">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {tool.title}
                      </h4>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        {tool.tag}
                      </span>
                    </div>
                  </div>
                  <Plus className="size-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug mt-1">{tool.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
