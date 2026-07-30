"use client";

import React, { useState } from "react";
import { X, Sparkles, Plus, Layers, Zap, CheckCircle2, AlertCircle, FileText } from "lucide-react";

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (node: { title: string; type: string; status: string }) => void;
}

export default function AddNodeModal({ isOpen, onClose, onAddNode }: AddNodeModalProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("trigger");
  const [status, setStatus] = useState("ready");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddNode({ title, type, status });
    setTitle("");
    onClose();
  };

  const nodeTypes = [
    { id: "trigger", name: "Trigger / Input", icon: Plus, desc: "Event entry point" },
    { id: "queue", name: "FastMCP Task Queue", icon: FileText, desc: "Task queue processing" },
    { id: "live", name: "Mem0 Live Agent", icon: Zap, desc: "Real-time SSE active agent" },
    { id: "review", name: "Review Node", icon: AlertCircle, desc: "Requires user verification" },
    { id: "success", name: "Finalized Node", icon: CheckCircle2, desc: "Completed milestone" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Layers className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add Workflow Node</h3>
              <p className="text-[11px] text-slate-400">Create a new node for your canvas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Node Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI Pitch Review Agent"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Node Category</label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-auto no-scrollbar pr-1">
              {nodeTypes.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{t.name}</p>
                        <span className="text-[10px] text-slate-400">{t.desc}</span>
                      </div>
                    </div>
                    {isSelected && <div className="size-2 rounded-full bg-blue-600" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ready">Ready (Standard)</option>
              <option value="active">Active (Processing)</option>
              <option value="live">Live (Mem0 SSE Stream)</option>
              <option value="warning">Needs Review (Warning)</option>
              <option value="success">Finalized (Success)</option>
            </select>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-colors"
            >
              <Plus className="size-4" />
              <span>Insert Node</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
