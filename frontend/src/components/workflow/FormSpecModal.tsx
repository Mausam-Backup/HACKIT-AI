"use client";

import React, { useState } from "react";
import { X, Sparkles, FileText, ArrowRight } from "lucide-react";

interface FormSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateFromSpec: (specText: string) => void;
}

export default function FormSpecModal({ isOpen, onClose, onGenerateFromSpec }: FormSpecModalProps) {
  const [specText, setSpecText] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specText.trim()) return;
    onGenerateFromSpec(specText);
    setSpecText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <FileText className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Import Problem Statement & Spec</h3>
              <p className="text-[11px] text-zinc-400">
                Paste raw hackathon spec to auto-generate workflow nodes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Raw Problem Statement / Specs
            </label>
            <textarea
              value={specText}
              onChange={(e) => setSpecText(e.target.value)}
              placeholder="e.g. Build an AI-powered financial risk analyzer with FastAPI backend, Next.js frontend, and FastMCP tool integration..."
              className="w-full h-36 p-3 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 leading-relaxed"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex items-start gap-2 text-xs text-purple-900">
            <Sparkles className="size-4 text-purple-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              HAC-KIT AI LiteParse engine will automatically extract key constraints, task queues, and agent requirements to build your canvas nodes.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-colors"
            >
              <span>Auto-Generate Nodes</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
