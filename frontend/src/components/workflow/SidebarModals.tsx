"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  Sliders,
  Activity,
  Bot,
  Layers,
  Settings,
  HelpCircle,
  User,
  Zap,
  CheckCircle2,
  Lock,
  Globe,
  Database,
  Cpu,
  RefreshCw,
  Keyboard,
  Compass,
} from "lucide-react";

// 1. Search / Command Palette Modal (Cmd+K)
export function SearchNodesModal({
  isOpen,
  onClose,
  onSelectNode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (title: string) => void;
}) {
  const [query, setQuery] = useState("");
  if (!isOpen) return null;

  const items = [
    { title: "LiteParse Document Parsing Agent", category: "Agent" },
    { title: "FastMCP Context Server Endpoint", category: "Integration" },
    { title: "Mem0 Persistent Vector Store", category: "Database" },
    { title: "AI Pitch Simulator (Video Feedback)", category: "Interviews" },
    { title: "Generative Pitch Deck Synthesizer", category: "Presentations" },
    { title: "Express 2FA Microservice Verification", category: "Security" },
  ];

  const filtered = items.filter((i) =>
    i.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-start justify-center pt-24 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-3 border-b border-zinc-100 flex items-center gap-2 bg-zinc-50/50">
          <Search className="size-4 text-zinc-400 ml-1 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes, tools, integrations..."
            className="flex-1 bg-transparent text-xs text-zinc-800 focus:outline-none"
            autoFocus
          />
          <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-zinc-400 border border-zinc-200">
            ESC
          </kbd>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-2 max-h-64 overflow-auto space-y-1">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectNode(item.title);
                onClose();
              }}
              className="p-2.5 rounded-xl hover:bg-zinc-100/70 hover:text-blue-700 cursor-pointer flex items-center justify-between transition-colors text-xs font-medium text-zinc-700"
            >
              <span>{item.title}</span>
              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md">
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 2. Control Center Modal
export function ControlCenterModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [speed, setSpeed] = useState("1.0x");
  const [timeout, setTimeoutVal] = useState("600s");
  const [autoRetry, setAutoRetry] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-zinc-900" />
            <h3 className="text-sm font-bold text-zinc-900">Control Center Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-zinc-700 block mb-1">Agent Concurrency Speed</label>
            <select
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              className="w-full p-2 border border-zinc-200 rounded-xl text-xs"
            >
              <option value="0.5x font-medium">0.5x (Safe Mode)</option>
              <option value="1.0x">1.0x (Standard Execution)</option>
              <option value="2.0x">2.0x (Turbo Concurrency)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-zinc-700 block mb-1">FastMCP Upstream Timeout</label>
            <select
              value={timeout}
              onChange={(e) => setTimeoutVal(e.target.value)}
              className="w-full p-2 border border-zinc-200 rounded-xl text-xs"
            >
              <option value="300s">300 seconds (5 mins)</option>
              <option value="600s">600 seconds (10 mins)</option>
              <option value="1200s">1200 seconds (20 mins)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100">
            <div>
              <p className="font-bold text-zinc-800">Auto-Retry Failed Tool Calls</p>
              <span className="text-[10px] text-zinc-400">Retry transient API timeouts automatically</span>
            </div>
            <input
              type="checkbox"
              checked={autoRetry}
              onChange={(e) => setAutoRetry(e.target.checked)}
              className="size-4 rounded accent-blue-600"
            />
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 bg-zinc-900 text-white font-bold rounded-xl shadow-md shadow-zinc-900/20"
          >
            Apply Configurations
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. AI Agents Fleet Modal
export function AgentsFleetModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const agents = [
    { name: "LiteParse Document Agent", status: "Active", load: "12%" },
    { name: "FastMCP Context Server Agent", status: "Active", load: "28%" },
    { name: "Mem0 Vector Memory Store", status: "Active", load: "5%" },
    { name: "AI Pitch Coach & Interviewer", status: "Ready", load: "0%" },
    { name: "Generative Pitch Synthesizer", status: "Active", load: "44%" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-zinc-900" />
            <h3 className="text-sm font-bold text-zinc-900">AI Agents Fleet Monitor</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-72 overflow-auto">
          {agents.map((a, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">{a.name}</h4>
                  <span className="text-[10px] text-zinc-400">Load: {a.load}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 4. Integrations Modal
export function IntegrationsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const integrations = [
    { name: "FastAPI Backend API", connected: true, type: "Core Server" },
    { name: "Mem0 Vector Database", connected: true, type: "Memory" },
    { name: "Express 2FA Microservice", connected: true, type: "Auth" },
    { name: "OpenAI / Gemini API", connected: true, type: "LLM Provider" },
    { name: "Unsplash / Recraft API", connected: true, type: "Image Generation" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-purple-600" />
            <h3 className="text-sm font-bold text-zinc-900">Connected Services & Integrations</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {integrations.map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-zinc-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-zinc-900">{item.name}</h4>
                <span className="text-[10px] text-zinc-400">{item.type}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-blue-700 border border-blue-200">
                Connected
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 5. Settings Modal
export function SystemSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Settings className="size-4 text-zinc-700" />
            <h3 className="text-sm font-bold text-zinc-900">System & Workspace Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
            <span className="font-bold text-zinc-700">Environment Mode</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-zinc-200 text-zinc-800">
              DEVELOPMENT (Port 3000)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
            <span className="font-bold text-zinc-700">FastAPI API Target</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-zinc-200 text-zinc-800">
              http://localhost:8000
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 bg-zinc-900 text-white font-bold rounded-xl mt-2"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

// 6. Help Desk Modal
export function HelpDeskModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <HelpCircle className="size-4 text-zinc-900" />
            <h3 className="text-sm font-bold text-zinc-900">Help Desk & Canvas Shortcuts</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 font-medium">Search Nodes & Tools</span>
            <kbd className="px-2 py-0.5 bg-zinc-100 font-mono rounded border text-zinc-700">⌘K</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 font-medium">Test Automation Pipeline</span>
            <kbd className="px-2 py-0.5 bg-zinc-100 font-mono rounded border text-zinc-700">Alt + R</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 font-medium">Add New Canvas Node</span>
            <kbd className="px-2 py-0.5 bg-zinc-100 font-mono rounded border text-zinc-700">N</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 font-medium">Zoom In / Zoom Out</span>
            <kbd className="px-2 py-0.5 bg-zinc-100 font-mono rounded border text-zinc-700">+</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

// 7. User Profile Modal
export function UserProfileModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-sm overflow-hidden text-center p-6 space-y-4">
        <div className="size-16 mx-auto rounded-2xl bg-zinc-900 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-zinc-900/30">
          HK
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-900">HAC-KIT Admin</h3>
          <p className="text-xs text-zinc-400">System Operator & Hackathon Builder</p>
        </div>
        <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-600 space-y-1">
          <p>Session ID: <span className="font-mono text-zinc-900">hk-admin-2026</span></p>
          <p>Role: <span className="font-bold text-emerald-600">Lead Architect</span></p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl"
        >
          Close Profile
        </button>
      </div>
    </div>
  );
}
