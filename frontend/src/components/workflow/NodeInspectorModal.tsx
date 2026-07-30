"use client";

import React, { useState, useEffect } from "react";
import { X, Trash2, Copy, Save, CheckCircle2, AlertCircle, Zap, FileText } from "lucide-react";

interface NodeData {
  id: string;
  title: string;
  type: string;
  status: string;
  x: number;
  y: number;
}

interface NodeInspectorModalProps {
  node: NodeData | null;
  onClose: () => void;
  onUpdateNode: (updated: NodeData) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (node: NodeData) => void;
}

export default function NodeInspectorModal({
  node,
  onClose,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
}: NodeInspectorModalProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("ready");
  const [type, setType] = useState("trigger");

  useEffect(() => {
    if (node) {
      setTitle(node.title);
      setStatus(node.status);
      setType(node.type);
    }
  }, [node]);

  if (!node) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateNode({
      ...node,
      title,
      status,
      type,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-zinc-100 text-zinc-900">
              <FileText className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Node Inspector</h3>
              <p className="text-[11px] text-zinc-400 font-mono">ID: {node.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-700 focus:outline-none"
              >
                <option value="trigger">Trigger</option>
                <option value="queue">Queue</option>
                <option value="live">Live Agent</option>
                <option value="review">Review</option>
                <option value="success">Success</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-700 focus:outline-none"
              >
                <option value="ready">Ready</option>
                <option value="active">Active</option>
                <option value="live">Live (Mem0)</option>
                <option value="warning">Warning</option>
                <option value="success">Finalized</option>
              </select>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onDeleteNode(node.id);
                  onClose();
                }}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                title="Delete Node"
              >
                <Trash2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onDuplicateNode(node);
                  onClose();
                }}
                className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                title="Duplicate Node"
              >
                <Copy className="size-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-950 text-white text-xs font-bold shadow-md shadow-zinc-900/20 transition-colors"
              >
                <Save className="size-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
