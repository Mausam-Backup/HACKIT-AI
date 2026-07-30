import React from 'react';
import Link from 'next/link';
import {
  TournamentCriteria,
  CoachMessage,
  ProblemAnalysis,
} from '@/services/coach-service';
import {
  ArrowLeft,
  PanelLeft,
  X,
  Settings,
  Zap,
  Trophy,
  RefreshCw
} from 'lucide-react';
import TournamentCriteriaAccordion from './TournamentCriteriaAccordion';

interface CoachSidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean) => void;
  criteria: Partial<TournamentCriteria>;
  setCriteria: (criteria: Partial<TournamentCriteria>) => void;
  isLoading: boolean;
  handleSend: (customPrompt?: string) => void;
  savedProjects: ProblemAnalysis[];
  setMessages: React.Dispatch<React.SetStateAction<CoachMessage[]>>;
  resetChat: () => void;
}

export default function CoachSidebar({
  mobileMenuOpen,
  setMobileMenuOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  criteria,
  setCriteria,
  isLoading,
  handleSend,
  savedProjects,
  setMessages,
  resetChat,
}: CoachSidebarProps) {
  return (
    <aside className={`absolute lg:relative z-40 h-full shrink-0 bg-white border-r border-gray-200 shadow-sm flex flex-col transition-all duration-300 overflow-hidden ${
      mobileMenuOpen ? 'w-80 translate-x-0' : '-translate-x-full lg:translate-x-0'
    } ${!mobileMenuOpen && isSidebarCollapsed ? 'lg:w-0 lg:border-r-0' : 'lg:w-80'}`}>
      
      {/* Inner fixed-width container to prevent layout squish during transition */}
      <div className="w-80 h-full flex flex-col">
        {/* Header Branding */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <Link href="/" className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
               <ArrowLeft className="w-4 h-4 text-slate-700" />
             </Link>
             <h1 className="text-sm font-black text-slate-900 tracking-widest uppercase">HACK-COACH</h1>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => setIsSidebarCollapsed(true)} className="hidden lg:flex p-2 text-slate-400 hover:text-slate-700 transition-colors" title="Collapse Sidebar">
                <PanelLeft className="w-4 h-4" />
             </button>
             <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-4 h-4" />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          {/* Configuration Accordion */}
          <div className="space-y-4">
             <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
               <Settings className="w-3.5 h-3.5" /> Strategy Configuration
             </h2>
             <TournamentCriteriaAccordion criteria={criteria} onChange={setCriteria} compact={true} />
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5" /> Quick Actions
            </h2>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Compare Statements', prompt: 'Compare 3 Problem Statements & pick the best winner' },
                { label: 'Recommend Tech Stack', prompt: 'Recommend Tech Stack for 24-hour hackathon' },
                { label: 'Feature MVP Roadmap', prompt: 'Generate MVP Feature Roadmap (Must-Haves vs Traps)' },
                { label: 'Pitch Deck Strategy', prompt: '3-Minute Live Pitch Strategy & Judge Tips' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  disabled={isLoading}
                  className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 text-left text-slate-600 hover:text-slate-900 transition-all text-xs font-medium disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Saved Projects */}
          {savedProjects.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-2">
                <Trophy className="w-3.5 h-3.5" /> Recent Saves
              </h2>
              <div className="flex flex-col gap-2">
                {savedProjects.map((proj, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMessages((prev) => [
                        ...prev,
                        {
                          id: `reopen-${Date.now()}`,
                          role: 'assistant',
                          content: `### 🏆 Loaded Saved Strategy: **${proj.title}**`,
                          analysis: proj,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        },
                      ]);
                      if(mobileMenuOpen) setMobileMenuOpen(false);
                    }}
                    className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 text-left text-slate-600 hover:text-slate-900 transition-all flex items-center justify-between gap-2"
                  >
                    <span className="truncate text-xs font-medium">{proj.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 shrink-0">
                      {proj.winScore}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-5 border-t border-gray-100 shrink-0">
           <button onClick={resetChat} className="w-full p-3 rounded-xl bg-transparent hover:bg-gray-50 text-[11px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors border border-gray-200">
             <RefreshCw className="w-3.5 h-3.5" /> Reset Session
           </button>
        </div>
      </div>
    </aside>
  );
}
