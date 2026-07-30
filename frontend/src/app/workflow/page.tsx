"use client";

import React, { useState } from "react";
import WorkflowSidebar from "@/components/workflow/WorkflowSidebar";
import WorkflowCanvas from "@/components/workflow/WorkflowCanvas";
import MermaidPanel from "@/components/workflow/MermaidPanel";

export default function WorkflowPage() {
  const [activeTab, setActiveTab] = useState("Automation");
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

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
        isLeftCollapsed={isLeftCollapsed}
        onToggleLeft={() => setIsLeftCollapsed(!isLeftCollapsed)}
        isRightCollapsed={isRightCollapsed}
        onToggleRight={() => setIsRightCollapsed(!isRightCollapsed)}
      />

      {/* Right AI Mermaid Panel */}
      <MermaidPanel
        isCollapsed={isRightCollapsed}
        onToggleCollapse={() => setIsRightCollapsed(!isRightCollapsed)}
      />
    </div>
  );
}
