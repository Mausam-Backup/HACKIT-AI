"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MousePointer,
  Square,
  Wrench,
  FileText,
  MessageSquare,
  Zap,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Move,
  PanelLeftOpen,
  PanelRightOpen,
  Send,
} from "lucide-react";

import AddNodeModal from "./AddNodeModal";
import NodeInspectorModal from "./NodeInspectorModal";
import FormSpecModal from "./FormSpecModal";
import ToolsLibraryDrawer from "./ToolsLibraryDrawer";
import ExecutionLogsDrawer from "./ExecutionLogsDrawer";
import { CanvasNodeData } from "@/lib/groqGenerator";

interface WorkflowCanvasProps {
  nodes?: CanvasNodeData[];
  setNodes?: React.Dispatch<React.SetStateAction<CanvasNodeData[]>>;
  isLeftCollapsed?: boolean;
  onToggleLeft?: () => void;
  isRightCollapsed?: boolean;
  onToggleRight?: () => void;
  onGenerateAi?: (prompt: string) => void;
  isAiGenerating?: boolean;
}

export default function WorkflowCanvas({
  nodes: externalNodes,
  setNodes: setExternalNodes,
  isLeftCollapsed,
  onToggleLeft,
  isRightCollapsed,
  onToggleRight,
  onGenerateAi,
  isAiGenerating = false,
}: WorkflowCanvasProps) {
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState("Move");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Modals & Drawers state
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [isFormSpecOpen, setIsFormSpecOpen] = useState(false);
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<CanvasNodeData | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showAiPromptBox, setShowAiPromptBox] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  // Internal Nodes state fallback (starts empty — user decides)
  const [internalNodes, setInternalNodes] = useState<CanvasNodeData[]>([]);

  const nodes = externalNodes || internalNodes;
  const setNodes = setExternalNodes || setInternalNodes;

  // Pan offset — used to auto-center the node group
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // Auto-center whenever the node set changes (fires after new AI generation)
  useEffect(() => {
    if (!nodes.length || !canvasRef.current) return;

    const NODE_W = 230;
    const NODE_H = 110;

    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs) + NODE_W;
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys) + NODE_H;

    const groupCenterX = (minX + maxX) / 2;
    const groupCenterY = (minY + maxY) / 2;

    const { clientWidth, clientHeight } = canvasRef.current;

    // Translate so the bounding-box center sits at the viewport center
    setPanX(clientWidth / 2 - groupCenterX);
    setPanY(clientHeight / 2 - groupCenterY);
  }, [nodes]); // intentionally omit zoom so centering doesn't re-fire on zoom

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; nodeX: number; nodeY: number; hasMoved: boolean }>({
    mouseX: 0,
    mouseY: 0,
    nodeX: 0,
    nodeY: 0,
    hasMoved: false,
  });

  // Dragging & Interaction Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, node: CanvasNodeData) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setDraggingNodeId(node.id);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      nodeX: node.x,
      nodeY: node.y,
      hasMoved: false,
    };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragStartRef.current.hasMoved = true;
    }

    const deltaX = dx * (100 / zoom);
    const deltaY = dy * (100 / zoom);

    setNodes((prev) =>
      prev.map((n) =>
        n.id === draggingNodeId
          ? {
              ...n,
              x: Math.max(20, dragStartRef.current.nodeX + deltaX),
              y: Math.max(20, dragStartRef.current.nodeY + deltaY),
            }
          : n
      )
    );
  };

  const handleCanvasMouseUp = () => {
    setDraggingNodeId(null);
  };

  const handleNodeMouseUp = (e: React.MouseEvent, node: CanvasNodeData) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (!dragStartRef.current.hasMoved) {
      setSelectedNode(node);
    }
    setDraggingNodeId(null);
  };

  const handleNodeContextMenu = (e: React.MouseEvent, node: CanvasNodeData) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedNode(node);
  };

  // Dynamic Center Coordinates for Connected Lines
  const getNodePos = (index: number, fallbackX: number, fallbackY: number) => {
    const n = nodes[index];
    return n ? { x: n.x + 90, y: n.y + 35 } : { x: fallbackX, y: fallbackY };
  };

  const pos0 = getNodePos(0, 470, 115);
  const pos1 = getNodePos(1, 470, 235);
  const pos2 = getNodePos(2, 450, 365);
  const pos3 = getNodePos(3, 450, 505);
  const pos4 = getNodePos(4, 770, 325);

  const handleTestAutomation = () => {
    setIsExecuting(true);
    setShowLogsDrawer(true);
    const newLogs = ["[0.0s] Initializing Groq LLM & FastMCP Pipeline..."];
    setExecutionLog(newLogs);

    setTimeout(() => {
      setExecutionLog((prev) => [
        ...prev,
        "[0.4s] Querying Groq llama-3.3-70b-versatile endpoint...",
      ]);
    }, 600);

    setTimeout(() => {
      setExecutionLog((prev) => [
        ...prev,
        "[1.2s] Synthesizing Mem0 vector embeddings & Mermaid flowchart...",
      ]);
    }, 1200);

    setTimeout(() => {
      setExecutionLog((prev) => [
        ...prev,
        "[1.8s] Rendering dynamic canvas nodes & SSE stream... Complete!",
      ]);
      setIsExecuting(false);
    }, 2000);
  };

  const handleAddNode = (newNode: { title: string; type: string; status: string }) => {
    const node: CanvasNodeData = {
      id: `node-${Date.now()}`,
      title: newNode.title,
      type: newNode.type as any,
      status: newNode.status,
      x: 300 + Math.random() * 150,
      y: 200 + Math.random() * 150,
    };
    setNodes((prev) => [...prev, node]);
  };

  const handleUpdateNode = (updated: CanvasNodeData) => {
    setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleDeleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDuplicateNode = (node: CanvasNodeData) => {
    const dup: CanvasNodeData = {
      ...node,
      id: `node-${Date.now()}`,
      x: node.x + 40,
      y: node.y + 40,
    };
    setNodes((prev) => [...prev, dup]);
  };

  const handleGenerateFromSpec = (specText: string) => {
    if (onGenerateAi) {
      onGenerateAi(specText);
    }
  };

  const handleToolClick = (toolName: string) => {
    setActiveTool(toolName);
    if (toolName === "Shape") {
      setIsAddNodeOpen(true);
    } else if (toolName === "Tool") {
      setIsToolsDrawerOpen(true);
    } else if (toolName === "Form") {
      setIsFormSpecOpen(true);
    } else if (toolName === "Comment") {
      setShowComments(!showComments);
    } else if (toolName === "Ask AI") {
      setShowAiPromptBox(!showAiPromptBox);
    }
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    if (onGenerateAi) {
      onGenerateAi(aiPrompt);
      setAiPrompt("");
      setShowAiPromptBox(false);
    }
  };

  return (
    <div
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      className="flex-1 h-screen flex flex-col bg-zinc-50 relative overflow-hidden select-none transition-all duration-200"
    >
      {/* Canvas Top Bar */}
      <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          {isLeftCollapsed && onToggleLeft && (
            <button
              onClick={onToggleLeft}
              className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-900 transition-colors"
              title="Expand Left Sidebar"
            >
              <PanelLeftOpen className="size-4" />
            </button>
          )}
          <div>
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <span>Canvas Workspace</span>
              <span className="px-1.5 py-0.5 rounded flex items-center gap-1 bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-wider border border-red-100">
                <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                Experimental
              </span>
              {isAiGenerating && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                  <RefreshCw className="size-3 animate-spin" />
                  Groq LLM Generating...
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-400">
              Type natural language prompts to draw interactive pipelines powered by Groq 70B.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestAutomation}
            disabled={isExecuting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isExecuting ? "animate-spin text-zinc-900" : ""}`} />
            <span>{isExecuting ? "Running..." : "Test Pipeline"}</span>
          </button>

          <button
            onClick={() => setIsAddNodeOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-900 text-white text-xs font-bold shadow-md shadow-zinc-900/20 transition-colors"
          >
            <Plus className="size-4" />
            <span>New Node</span>
          </button>

          {isRightCollapsed && onToggleRight && (
            <button
              onClick={onToggleRight}
              className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-900 transition-colors"
              title="Expand Mermaid Studio"
            >
              <PanelRightOpen className="size-4" />
            </button>
          )}
        </div>
      </header>

      {/* Grid Canvas Area — fills all remaining space, scrollable */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]"
      >
        {/* Inner panned+scaled surface */}
        <div
          className="absolute"
          style={{
            width: "3000px",
            height: "2400px",
            left: 0,
            top: 0,
            transform: `translate(${panX}px, ${panY}px) scale(${zoom / 100})`,
            transformOrigin: "0 0",
          }}
        >
        {/* Dynamic SVG Connecting Lines */}
        <svg className="absolute inset-0 size-full pointer-events-none z-0">
          {nodes.length >= 2 && (
            <path
              d={`M ${pos0.x} ${pos0.y} C ${pos0.x} ${(pos0.y + pos1.y) / 2}, ${pos1.x} ${(pos0.y + pos1.y) / 2}, ${pos1.x} ${pos1.y}`}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
          )}
          {nodes.length >= 3 && (
            <path
              d={`M ${pos1.x} ${pos1.y} C ${pos1.x} ${(pos1.y + pos2.y) / 2}, ${pos2.x} ${(pos1.y + pos2.y) / 2}, ${pos2.x} ${pos2.y}`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}
          {nodes.length >= 4 && (
            <path
              d={`M ${pos2.x} ${pos2.y} C ${pos2.x} ${(pos2.y + pos3.y) / 2}, ${pos3.x} ${(pos2.y + pos3.y) / 2}, ${pos3.x} ${pos3.y}`}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
            />
          )}
          {nodes.length >= 5 && (
            <path
              d={`M ${pos1.x} ${pos1.y} C ${(pos1.x + pos4.x) / 2} ${pos1.y}, ${(pos1.x + pos4.x) / 2} ${pos4.y}, ${pos4.x} ${pos4.y}`}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeDasharray="6 6"
            />
          )}
        </svg>

        {/* Floating Entry Point Card — only shown on empty canvas */}
        {nodes.length === 0 && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-5 bg-white/95 backdrop-blur rounded-2xl border border-zinc-200 shadow-2xl w-72 z-10 text-center">
            <div className="size-12 mx-auto mb-3 rounded-2xl bg-zinc-100 flex items-center justify-center">
              <Sparkles className="size-6 text-zinc-900" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 mb-1">Start Your Pipeline</h3>
            <p className="text-[11px] text-zinc-400 mb-4">Type a prompt in the toolbar or pick an entry method below</p>
            <div className="space-y-2 text-xs font-semibold">
              <div
                onClick={() => setIsFormSpecOpen(true)}
                className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-100 cursor-pointer transition-all flex items-center gap-2"
              >
                <span>📄</span><span>Direct Spec Entry (Groq AI)</span>
              </div>
              <div
                onClick={() => setIsToolsDrawerOpen(true)}
                className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-100 cursor-pointer transition-all flex items-center gap-2"
              >
                <span>⚡</span><span>FastMCP Pipeline Tools</span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Prompt Box (Triggered by 'Ask AI' toolbar button) */}
        {showAiPromptBox && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 bg-white p-3 rounded-2xl shadow-2xl border border-zinc-200 w-96 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <form onSubmit={handleAiSubmit} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                <span className="flex items-center gap-1.5 text-zinc-900">
                  <Sparkles className="size-4" /> Groq 70B Workflow AI
                </span>
                <button
                  type="button"
                  onClick={() => setShowAiPromptBox(false)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe your hackathon workflow (e.g. Health AI app)..."
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-zinc-900"
                autoFocus
              />
              <button
                type="submit"
                disabled={isAiGenerating || !aiPrompt.trim()}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                {isAiGenerating ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Generating Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" />
                    <span>Generate Workflow & Canvas</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── AI Generation Skeleton Overlay ── */}
        {isAiGenerating && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Dimming tint */}
            <div className="absolute inset-0 bg-zinc-50/80 backdrop-blur-[1px]" />

            {/* Floating status banner */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-cyan-200 shadow-2xl shadow-zinc-900/10">
                <div className="relative flex items-center justify-center size-8 rounded-xl bg-zinc-100">
                  <RefreshCw className="size-4 text-zinc-900 animate-spin" />
                  <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-zinc-900 animate-pulse border-2 border-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Groq 70B is synthesizing your pipeline…</p>
                  <p className="text-[10px] text-zinc-400 font-medium">Building canvas nodes &amp; Mermaid flowchart</p>
                </div>
                <div className="flex gap-1 ml-2">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 rounded-full bg-cyan-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Skeleton SVG connector lines */}
            <svg className="absolute inset-0 size-full pointer-events-none">
              <path
                d="M 470 155 C 470 220, 470 220, 470 275"
                fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="6 6"
                className="animate-pulse"
              />
              <path
                d="M 470 335 C 470 390, 450 390, 450 420"
                fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4"
                className="animate-pulse"
              />
              <path
                d="M 450 485 C 450 530, 450 530, 450 560"
                fill="none" stroke="#e2e8f0" strokeWidth="2"
                className="animate-pulse"
              />
              <path
                d="M 470 305 C 620 305, 680 325, 770 325"
                fill="none" stroke="#e2e8f0" strokeWidth="2.5" strokeDasharray="6 6"
                className="animate-pulse"
              />
            </svg>

            {/* Skeleton Node cards */}
            {[
              { x: 370, y: 80,  w: 200, h: 64 },
              { x: 370, y: 195, w: 192, h: 56 },
              { x: 350, y: 330, w: 220, h: 52 },
              { x: 350, y: 470, w: 200, h: 52 },
              { x: 660, y: 285, w: 224, h: 68 },
            ].map((s, i) => (
              <div
                key={i}
                className="absolute rounded-2xl bg-white border border-zinc-200 shadow-md overflow-hidden"
                style={{ left: s.x, top: s.y, width: s.w, height: s.h }}
              >
                {/* shimmer sweep */}
                <div
                  className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite]"
                  style={{
                    background:
                      "linear-gradient(90deg,transparent 0%,rgba(148,163,184,0.15) 50%,transparent 100%)",
                    animationDelay: `${i * 0.18}s`,
                  }}
                />
                <div className="p-3 flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-zinc-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2.5 rounded-full bg-zinc-100 animate-pulse w-4/5" />
                    <div className="h-2 rounded-full bg-zinc-100 animate-pulse w-3/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Draggable Dynamic Nodes Layer */}
        {nodes.map((node) => {
          const isDragging = draggingNodeId === node.id;
          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onMouseUp={(e) => handleNodeMouseUp(e, node)}
              onContextMenu={(e) => handleNodeContextMenu(e, node)}
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
              className={`absolute z-10 cursor-grab active:cursor-grabbing transition-shadow ${
                isDragging ? "shadow-2xl ring-2 ring-zinc-900 scale-105" : "hover:shadow-lg"
              }`}
            >
              {/* ── TRIGGER NODE ── */}
              {node.type === "trigger" && (
                <div className="flex items-center gap-2 px-5 py-3 rounded-full border-2 border-dashed border-zinc-900 bg-white shadow-md text-sm font-bold text-zinc-700 hover:border-zinc-900 transition-colors">
                  <span className="size-2 rounded-full bg-zinc-900 animate-ping shrink-0" />
                  <span>{node.title}</span>
                  <Plus className="size-3.5 text-zinc-400 opacity-60" />
                </div>
              )}

              {/* ── QUEUE / PROCESSOR NODE ── */}
              {node.type === "queue" && (
                <div className="w-52 p-4 rounded-2xl bg-white border border-zinc-200 shadow-lg text-center hover:border-cyan-300 transition-colors">
                  <div className="size-11 mx-auto rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 mb-2.5">
                    <FileText className="size-5" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-800">{node.title}</h4>
                  <span className="text-[11px] text-zinc-400 font-medium">Auto-dispatching</span>
                </div>
              )}

              {/* ── REVIEW / WARNING NODE ── */}
              {node.type === "review" && (
                <div className="px-5 py-3 rounded-full bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 hover:bg-amber-600 transition-colors">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{node.title}</span>
                </div>
              )}

              {/* ── SUCCESS / OUTPUT NODE ── */}
              {node.type === "success" && (
                <div className="px-5 py-3 rounded-full bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center gap-2 hover:bg-emerald-700 transition-colors">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{node.title}</span>
                </div>
              )}

              {/* ── LIVE / STREAMING NODE ── */}
              {node.type === "live" && (
                <div className="w-60 p-4 rounded-2xl bg-white border-2 border-zinc-900 shadow-xl shadow-zinc-900/10 flex items-center gap-3 hover:border-zinc-900 transition-colors">
                  <div className="size-11 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 border border-zinc-200">
                    <Zap className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">{node.title}</h4>
                    <span className="text-[11px] text-zinc-900 font-bold flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-zinc-900 animate-pulse" />
                      Mem0 SSE Active
                    </span>
                  </div>
                </div>
              )}

              {/* Comment sticky note */}
              {showComments && node.id === nodes[0]?.id && (
                <div className="mt-2 p-3 rounded-xl bg-amber-100 text-amber-900 text-[10px] font-medium shadow-md w-52 leading-tight border border-amber-200">
                  💬 Note: Verified judge rubric criteria.
                </div>
              )}
            </div>
          );
        })}
        </div> {/* end inner scaled surface */}
      </div>

      {/* Floating Bottom Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-white border border-zinc-200 shadow-2xl text-zinc-600 text-xs font-medium shrink-0">
          {[
            { name: "Move", icon: MousePointer },
            { name: "Shape", icon: Square },
            { name: "Tool", icon: Wrench },
            { name: "Form", icon: FileText },
            { name: "Comment", icon: MessageSquare },
            { name: "Ask AI", icon: Sparkles },
          ].map((tool) => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.name;
            return (
              <button
                key={tool.name}
                onClick={() => handleToolClick(tool.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all shrink-0 whitespace-nowrap ${
                  isSelected
                    ? "bg-zinc-900 text-white font-bold shadow-md shadow-zinc-900/20"
                    : "hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <Icon className="size-3.5 shrink-0" />
                <span className="whitespace-nowrap">{tool.name}</span>
              </button>
            );
          })}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-white border border-zinc-200 shadow-2xl text-zinc-600 text-xs font-semibold">
          <button
            onClick={() => setZoom((z) => Math.max(40, z - 10))}
            className="p-1 hover:bg-zinc-100 rounded-lg"
            title="Zoom out"
          >
            <ZoomOut className="size-3.5" />
          </button>
          <span className="w-10 text-center font-mono">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
            className="p-1 hover:bg-zinc-100 rounded-lg"
            title="Zoom in"
          >
            <ZoomIn className="size-3.5" />
          </button>
          <div className="w-px h-4 bg-zinc-200 mx-1" />
          <button
            onClick={() => setZoom(100)}
            className="px-2 py-0.5 rounded-lg hover:bg-zinc-100 text-[10px] font-bold text-zinc-500 hover:text-zinc-800 transition-colors whitespace-nowrap"
            title="Reset to 100%"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Modals & Drawers */}
      <AddNodeModal
        isOpen={isAddNodeOpen}
        onClose={() => setIsAddNodeOpen(false)}
        onAddNode={handleAddNode}
      />

      <NodeInspectorModal
        node={selectedNode as any}
        onClose={() => setSelectedNode(null)}
        onUpdateNode={handleUpdateNode as any}
        onDeleteNode={handleDeleteNode}
        onDuplicateNode={handleDuplicateNode as any}
      />

      <FormSpecModal
        isOpen={isFormSpecOpen}
        onClose={() => setIsFormSpecOpen(false)}
        onGenerateFromSpec={handleGenerateFromSpec}
      />

      <ToolsLibraryDrawer
        isOpen={isToolsDrawerOpen}
        onClose={() => setIsToolsDrawerOpen(false)}
        onSelectTool={handleAddNode}
      />

      <ExecutionLogsDrawer
        isOpen={showLogsDrawer}
        onClose={() => setShowLogsDrawer(false)}
        logs={executionLog}
        onClearLogs={() => setExecutionLog([])}
      />
    </div>
  );
}
