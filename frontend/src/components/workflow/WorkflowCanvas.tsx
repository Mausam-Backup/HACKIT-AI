"use client";

import React, { useState, useRef } from "react";
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
} from "lucide-react";

import AddNodeModal from "./AddNodeModal";
import NodeInspectorModal from "./NodeInspectorModal";
import FormSpecModal from "./FormSpecModal";
import ToolsLibraryDrawer from "./ToolsLibraryDrawer";
import ExecutionLogsDrawer from "./ExecutionLogsDrawer";

interface NodeData {
  id: string;
  title: string;
  type: string;
  status: string;
  x: number;
  y: number;
}

interface WorkflowCanvasProps {
  isLeftCollapsed?: boolean;
  onToggleLeft?: () => void;
  isRightCollapsed?: boolean;
  onToggleRight?: () => void;
}

export default function WorkflowCanvas({
  isLeftCollapsed,
  onToggleLeft,
  isRightCollapsed,
  onToggleRight,
}: WorkflowCanvasProps) {
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState("Move");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);

  // Modals & Drawers state
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [isFormSpecOpen, setIsFormSpecOpen] = useState(false);
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [showComments, setShowComments] = useState(false);

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; nodeX: number; nodeY: number; hasMoved: boolean }>({
    mouseX: 0,
    mouseY: 0,
    nodeX: 0,
    nodeY: 0,
    hasMoved: false,
  });

  // Interactive Nodes State
  const [nodes, setNodes] = useState<NodeData[]>([
    {
      id: "trigger-1",
      title: "5 New Problem Statements",
      type: "trigger",
      x: 380,
      y: 80,
      status: "ready",
    },
    {
      id: "queue-1",
      title: "Task Queue / FastMCP",
      type: "queue",
      x: 380,
      y: 200,
      status: "active",
    },
    {
      id: "review-1",
      title: "3 Tasks Need Review",
      type: "review",
      x: 360,
      y: 340,
      status: "warning",
    },
    {
      id: "final-1",
      title: "12 Tasks Finalized",
      type: "success",
      x: 360,
      y: 480,
      status: "success",
    },
    {
      id: "live-1",
      title: "Live Processing (Mem0)",
      type: "live",
      x: 680,
      y: 290,
      status: "live",
    },
  ]);

  // Dragging & Interaction Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, node: NodeData) => {
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

  const handleNodeMouseUp = (e: React.MouseEvent, node: NodeData) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (!dragStartRef.current.hasMoved) {
      setSelectedNode(node);
    }
    setDraggingNodeId(null);
  };

  const handleNodeContextMenu = (e: React.MouseEvent, node: NodeData) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedNode(node);
  };

  // Dynamic Center Coordinates for Connected Lines
  const getNodeCenter = (id: string, fallbackX: number, fallbackY: number) => {
    const n = nodes.find((node) => node.id === id);
    return n ? { x: n.x + 90, y: n.y + 35 } : { x: fallbackX, y: fallbackY };
  };

  const triggerPos = getNodeCenter("trigger-1", 470, 115);
  const queuePos = getNodeCenter("queue-1", 470, 235);
  const reviewPos = getNodeCenter("review-1", 450, 365);
  const finalPos = getNodeCenter("final-1", 450, 505);
  const livePos = getNodeCenter("live-1", 770, 325);

  const handleTestAutomation = () => {
    setIsExecuting(true);
    setShowLogsDrawer(true);
    const newLogs = ["[0.0s] Initializing FastMCP Context Server..."];
    setExecutionLog(newLogs);

    setTimeout(() => {
      setExecutionLog((prev) => [
        ...prev,
        "[0.4s] Parsing problem statement via LiteParse engine...",
      ]);
    }, 600);

    setTimeout(() => {
      setExecutionLog((prev) => [
        ...prev,
        "[1.2s] Querying Mem0 vector embeddings & session memory...",
      ]);
    }, 1200);

    setTimeout(() => {
      setExecutionLog((prev) => [
        ...prev,
        "[1.8s] Generating interactive slide deck & SSE stream... Complete!",
      ]);
      setIsExecuting(false);
    }, 2000);
  };

  const handleAddNode = (newNode: { title: string; type: string; status: string }) => {
    const node: NodeData = {
      id: `node-${Date.now()}`,
      title: newNode.title,
      type: newNode.type,
      status: newNode.status,
      x: 300 + Math.random() * 150,
      y: 200 + Math.random() * 150,
    };
    setNodes((prev) => [...prev, node]);
  };

  const handleUpdateNode = (updated: NodeData) => {
    setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleDeleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDuplicateNode = (node: NodeData) => {
    const dup: NodeData = {
      ...node,
      id: `node-${Date.now()}`,
      x: node.x + 40,
      y: node.y + 40,
    };
    setNodes((prev) => [...prev, dup]);
  };

  const handleGenerateFromSpec = (specText: string) => {
    const createdNode: NodeData = {
      id: `node-${Date.now()}`,
      title: `Parsed Spec: ${specText.slice(0, 24)}...`,
      type: "trigger",
      status: "ready",
      x: 200,
      y: 140,
    };
    setNodes((prev) => [...prev, createdNode]);
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
      const inputEl = document.getElementById("mermaid-ai-input");
      if (inputEl) inputEl.focus();
    }
  };

  return (
    <div
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      className="flex-1 h-screen flex flex-col bg-slate-50 relative overflow-hidden select-none transition-all duration-200"
    >
      {/* Canvas Top Bar */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          {isLeftCollapsed && onToggleLeft && (
            <button
              onClick={onToggleLeft}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-cyan-600 transition-colors"
              title="Expand Left Sidebar"
            >
              <PanelLeftOpen className="size-4" />
            </button>
          )}
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Hi, Hackathon Builder! 👋
            </h2>
            <p className="text-xs text-slate-400">
              Drag nodes, build multi-agent pipelines, and auto-export flowcharts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestAutomation}
            disabled={isExecuting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isExecuting ? "animate-spin text-cyan-600" : ""}`} />
            <span>{isExecuting ? "Running..." : "Test Pipeline"}</span>
          </button>

          <button
            onClick={() => setIsAddNodeOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition-colors"
          >
            <Plus className="size-4" />
            <span>New Node</span>
          </button>

          {isRightCollapsed && onToggleRight && (
            <button
              onClick={onToggleRight}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-cyan-600 transition-colors"
              title="Expand Mermaid Studio"
            >
              <PanelRightOpen className="size-4" />
            </button>
          )}
        </div>
      </header>

      {/* Grid Canvas Area */}
      <div
        className="flex-1 relative overflow-auto bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
      >
        {/* Dynamic SVG Connecting Lines */}
        <svg className="absolute inset-0 size-full pointer-events-none z-0">
          <path
            d={`M ${triggerPos.x} ${triggerPos.y} C ${triggerPos.x} ${(triggerPos.y + queuePos.y) / 2}, ${queuePos.x} ${(triggerPos.y + queuePos.y) / 2}, ${queuePos.x} ${queuePos.y}`}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeDasharray="6 6"
          />

          <path
            d={`M ${queuePos.x} ${queuePos.y} C ${queuePos.x} ${(queuePos.y + reviewPos.y) / 2}, ${reviewPos.x} ${(queuePos.y + reviewPos.y) / 2}, ${reviewPos.x} ${reviewPos.y}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          <path
            d={`M ${reviewPos.x} ${reviewPos.y} C ${reviewPos.x} ${(reviewPos.y + finalPos.y) / 2}, ${finalPos.x} ${(reviewPos.y + finalPos.y) / 2}, ${finalPos.x} ${finalPos.y}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
          />

          <path
            d={`M ${queuePos.x} ${queuePos.y} C ${(queuePos.x + livePos.x) / 2} ${queuePos.y}, ${(queuePos.x + livePos.x) / 2} ${livePos.y}, ${livePos.x} ${livePos.y}`}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeDasharray="6 6"
          />
        </svg>

        {/* Floating Entry Point Card */}
        <div className="absolute left-28 top-36 p-4 bg-white/90 backdrop-blur rounded-2xl border border-slate-200 shadow-xl w-64 z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Choose Entry Point
            </span>
            <Sparkles className="size-3.5 text-cyan-600" />
          </div>
          <div className="space-y-2 text-xs font-semibold">
            <div
              onClick={() => setIsFormSpecOpen(true)}
              className="p-2 rounded-lg bg-slate-50 border border-slate-100 hover:border-cyan-400 cursor-pointer transition-colors"
            >
              📄 Direct Spec Entry
            </div>
            <div
              onClick={() => setIsToolsDrawerOpen(true)}
              className="p-2 rounded-lg bg-slate-50 border border-slate-100 hover:border-cyan-400 cursor-pointer transition-colors"
            >
              ⚡ FastMCP Pipeline
            </div>
          </div>
        </div>

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
                isDragging ? "shadow-2xl ring-2 ring-cyan-500 scale-105" : "hover:shadow-lg"
              }`}
            >
              {node.type === "trigger" && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-dashed border-cyan-400 bg-white shadow-sm text-xs font-bold text-slate-700 hover:border-cyan-600">
                  <div className="size-2 rounded-full bg-cyan-500 animate-ping" />
                  <span>{node.title}</span>
                  <Move className="size-3 text-slate-400 opacity-50" />
                </div>
              )}

              {node.type === "queue" && (
                <div className="w-48 p-4 rounded-2xl bg-white border border-slate-200 shadow-lg text-center hover:border-cyan-400">
                  <div className="size-10 mx-auto rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 mb-2">
                    <FileText className="size-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">{node.title}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">Auto-dispatching</span>
                </div>
              )}

              {node.type === "review" && (
                <div className="px-5 py-2.5 rounded-full bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 hover:bg-amber-600">
                  <AlertCircle className="size-4" />
                  <span>{node.title}</span>
                </div>
              )}

              {node.type === "success" && (
                <div className="px-5 py-2.5 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 hover:bg-emerald-700">
                  <CheckCircle2 className="size-4" />
                  <span>{node.title}</span>
                </div>
              )}

              {node.type === "live" && (
                <div className="w-56 p-4 rounded-2xl bg-white border-2 border-cyan-500 shadow-xl shadow-cyan-500/10 flex items-center gap-3 hover:border-cyan-600">
                  <div className="size-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold shrink-0">
                    <Zap className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{node.title}</h4>
                    <span className="text-[10px] text-cyan-600 font-bold flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-cyan-500 animate-pulse" />
                      Mem0 SSE Active
                    </span>
                  </div>
                </div>
              )}

              {/* Comment sticky note */}
              {showComments && (
                <div className="mt-2 p-2 rounded-xl bg-amber-100 text-amber-900 text-[10px] font-medium shadow-md w-44 leading-tight border border-amber-200">
                  💬 Note: Verified judge rubric criteria.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xl text-slate-600 text-xs font-medium">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  isSelected
                    ? "bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20"
                    : "hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{tool.name}</span>
              </button>
            );
          })}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xl text-slate-600 text-xs font-semibold">
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            className="p-1 hover:bg-slate-100 rounded-lg"
          >
            <ZoomOut className="size-3.5" />
          </button>
          <span className="w-10 text-center font-mono">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(150, z + 10))}
            className="p-1 hover:bg-slate-100 rounded-lg"
          >
            <ZoomIn className="size-3.5" />
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
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onUpdateNode={handleUpdateNode}
        onDeleteNode={handleDeleteNode}
        onDuplicateNode={handleDuplicateNode}
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
