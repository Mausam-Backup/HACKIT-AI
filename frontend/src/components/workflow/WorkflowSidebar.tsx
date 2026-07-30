"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  GitFork,
  Sliders,
  Activity,
  Bot,
  Terminal,
  Layers,
  ChevronRight,
  Settings,
  HelpCircle,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import {
  SearchNodesModal,
  ControlCenterModal,
  AgentsFleetModal,
  IntegrationsModal,
  SystemSettingsModal,
  HelpDeskModal,
  UserProfileModal,
} from "./SidebarModals";

interface WorkflowSidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onAddNode?: (node: { title: string; type: string; status: string }) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function WorkflowSidebar({
  activeTab = "Automation",
  onSelectTab,
  onAddNode,
  isCollapsed,
  onToggleCollapse,
}: WorkflowSidebarProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [isAgentsOpen, setIsAgentsOpen] = useState(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSelect = (name: string) => {
    setCurrentTab(name);
    if (onSelectTab) onSelectTab(name);

    if (name === "Control Center") {
      setIsControlCenterOpen(true);
    } else if (name === "AI Agents") {
      setIsAgentsOpen(true);
    } else if (name === "Integrations") {
      setIsIntegrationsOpen(true);
    }
  };

  const mainMenu = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Automation", icon: GitFork, href: "/workflow" },
    { name: "Control Center", icon: Sliders, href: "#" },
    { name: "Active Workflows", icon: Activity, href: "#" },
    { name: "AI Agents", icon: Bot, href: "#" },
    { name: "Execution Logs", icon: Terminal, href: "#" },
    { name: "Integrations", icon: Layers, href: "#" },
  ];

  if (isCollapsed) {
    return (
      <aside className="w-16 h-screen bg-white border-r border-slate-200/80 flex flex-col items-center py-4 justify-between shrink-0 select-none text-slate-700 font-sans z-20">
        <div className="flex flex-col items-center gap-6">
          {/* AMOLED Dark Logo Icon */}
          <button
            onClick={onToggleCollapse}
            className="size-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-700/50 flex items-center justify-center text-white shadow-md hover:border-cyan-500/50 transition-all"
            title="Expand Sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M 9 4 L 5 4 L 5 18 L 9 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 15 6 L 19 6 L 19 20 L 15 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 5 12 L 19 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 20 0 C 20 1.5 21.5 3 23 3 C 21.5 3 20 4.5 20 6 C 20 4.5 18.5 3 17 3 C 18.5 3 20 1.5 20 0 Z" fill="currentColor"/>
            </svg>
          </button>

          {/* Quick Icons */}
          <div className="space-y-3">
            {mainMenu.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => handleSelect(item.name)}
                  title={item.name}
                  className={`p-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="size-4" />
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Expand Sidebar"
        >
          <PanelLeftOpen className="size-5 text-cyan-600" />
        </button>
      </aside>
    );
  }

  return (
    <>
      <aside className="w-64 h-screen bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 select-none text-slate-700 text-sm font-sans z-20 transition-all duration-200">
        {/* Top Header & Logo */}
        <div>
          <div className="p-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              {/* AMOLED Dark Monogram Logo Badge matching main website */}
              <div className="size-9 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-700/60 flex items-center justify-center text-white shadow-md">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 9 4 L 5 4 L 5 18 L 9 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 15 6 L 19 6 L 19 20 L 15 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 5 12 L 19 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 20 0 C 20 1.5 21.5 3 23 3 C 21.5 3 20 4.5 20 6 C 20 4.5 18.5 3 17 3 C 18.5 3 20 1.5 20 0 Z" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-slate-900 tracking-tight text-base leading-none">
                  HAC-KIT Flow
                </h1>
                <span className="text-[11px] text-cyan-600 font-semibold">
                  Multi-Agent Canvas
                </span>
              </div>
            </div>

            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="size-4" />
            </button>
          </div>

          {/* Search Trigger */}
          <div className="px-4 pt-4 pb-2">
            <div
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100/70 border border-slate-200/60 text-slate-400 text-xs hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-2">
                <i className="ph ph-magnifying-glass text-sm"></i>
                Search nodes...
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-500 border border-slate-200 shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Main Menu List */}
          <div className="px-3 pt-3">
            <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Main Menu
            </span>
            <nav className="mt-2 space-y-1">
              {mainMenu.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleSelect(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`size-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <div className="size-1.5 rounded-full bg-white animate-pulse" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sub Groups */}
          <div className="px-3 pt-4 border-t border-slate-100 mt-4">
            <div className="space-y-1 text-xs font-medium text-slate-500">
              <button
                onClick={() => setIsIntegrationsOpen(true)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-100/70 transition-colors text-slate-600"
              >
                <span>App Components</span>
                <ChevronRight className="size-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => setIsControlCenterOpen(true)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-100/70 transition-colors text-slate-600"
              >
                <span>Sync History</span>
                <ChevronRight className="size-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom General & Profile */}
        <div className="p-3 border-t border-slate-100 space-y-3">
          <div>
            <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              General
            </span>
            <div className="mt-1.5 space-y-0.5 text-xs text-slate-600">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-100/70 transition-colors"
              >
                <Settings className="size-4 text-slate-400" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => setIsHelpOpen(true)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-100/70 transition-colors"
              >
                <HelpCircle className="size-4 text-slate-400" />
                <span>Help Desk</span>
              </button>
              <Link
                href="/"
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
              >
                <LogOut className="size-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>

          {/* User Profile Badge with AMOLED Dark Icon */}
          <div
            onClick={() => setIsProfileOpen(true)}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="size-8 rounded-lg bg-zinc-950 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs border border-zinc-800">
                HK
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">HAC-KIT Admin</p>
                <span className="text-[10px] text-cyan-600 font-semibold">System Operator</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Interactive Modals */}
      <SearchNodesModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectNode={(title) => {
          if (onAddNode) {
            onAddNode({ title, type: "trigger", status: "ready" });
          }
        }}
      />

      <ControlCenterModal
        isOpen={isControlCenterOpen}
        onClose={() => setIsControlCenterOpen(false)}
      />

      <AgentsFleetModal
        isOpen={isAgentsOpen}
        onClose={() => setIsAgentsOpen(false)}
      />

      <IntegrationsModal
        isOpen={isIntegrationsOpen}
        onClose={() => setIsIntegrationsOpen(false)}
      />

      <SystemSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <HelpDeskModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
}
