"use client";

import React, { useState } from "react";
import WorkflowSidebar from "@/components/workflow/WorkflowSidebar";
import WorkflowCanvas from "@/components/workflow/WorkflowCanvas";
import MermaidPanel from "@/components/workflow/MermaidPanel";
import { generateWorkflowFromGroq, CanvasNodeData } from "@/lib/groqGenerator";

export default function WorkflowPage() {
  const [activeTab, setActiveTab] = useState("Automation");
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  // Shared State across Canvas & Mermaid AI Studio
  const [mermaidCode, setMermaidCode] = useState(`graph TD
    User([User Problem Spec]) --> Router{Agent Router}
    Router -->|Decompose| Coach[AI Hack Coach]
    Router -->|Context| FastMCP[FastMCP Context Server]
    FastMCP --> Mem0[(Mem0 Vector Store)]
    Coach --> CodeGen[Enterprise CLI Agent]
    CodeGen --> Presentation[Pitch Deck Synthesizer]
    Presentation --> Export([PPTX / PDF Output])`);

  const [nodes, setNodes] = useState<CanvasNodeData[]>([]);

  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Handle Natural Language Groq Generation Trigger
  const handleGenerateAiWorkflow = async (prompt: string) => {
    if (!prompt.trim()) return;
    setIsAiGenerating(true);

    try {
      const result = await generateWorkflowFromGroq(prompt);
      if (result.mermaidCode) {
        setMermaidCode(result.mermaidCode);
      }
      if (result.canvasNodes && result.canvasNodes.length > 0) {
        setNodes(result.canvasNodes);
      }
    } catch (err) {
      console.error("AI Generation Failed:", err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased">
      {/* Left Sidebar Menu */}
      <WorkflowSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isLeftCollapsed}
        onToggleCollapse={() => setIsLeftCollapsed(!isLeftCollapsed)}
      />

      {/* Main Center Canvas */}
      <WorkflowCanvas
        nodes={nodes}
        setNodes={setNodes}
        isLeftCollapsed={isLeftCollapsed}
        onToggleLeft={() => setIsLeftCollapsed(!isLeftCollapsed)}
        isRightCollapsed={isRightCollapsed}
        onToggleRight={() => setIsRightCollapsed(!isRightCollapsed)}
        onGenerateAi={handleGenerateAiWorkflow}
        isAiGenerating={isAiGenerating}
      />

      {/* Right AI Mermaid Panel */}
      <MermaidPanel
        mermaidCode={mermaidCode}
        setMermaidCode={setMermaidCode}
        isCollapsed={isRightCollapsed}
        onToggleCollapse={() => setIsRightCollapsed(!isRightCollapsed)}
        onGenerateAi={handleGenerateAiWorkflow}
        isAiGenerating={isAiGenerating}
      />
    </div>
  );
}
