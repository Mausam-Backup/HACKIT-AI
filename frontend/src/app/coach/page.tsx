"use client";
import Image from 'next/image';

import React, { useState, useRef, useEffect } from 'react';
import ProblemCard from '@/components/coach/ProblemCard';
import ComparisonMatrix from '@/components/coach/ComparisonMatrix';
import MarkdownRenderer from '@/components/coach/MarkdownRenderer';
import CoachSidebar from '@/components/coach/CoachSidebar';
import CoachChatInput from '@/components/coach/CoachChatInput';
import {
  TournamentCriteria,
  CoachMessage,
  Attachment,
  ProblemAnalysis,
  processFile,
  sendCoachMessage,
} from '@/services/coach-service';
import {
  User,
  AlertCircle,
  ChevronDown,
  Scale,
  FileText,
  Sparkles,
  RefreshCw,
  Zap,
  Image as ImageIcon,
  Menu
} from 'lucide-react';

export default function CoachPage() {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `### 🏆 Welcome to HACK-COACH AI!
      
I'm your **AI Hackathon Mentor & Project Strategist**, connected to **OpenRouter OSS 120B**.

Whether you're competing at a **College, State, National, or Global Hackathon**, I will help you:
1. 🎯 **Select & Rank the Best Problem Statement** with maximum win probability.
2. 🛠️ **Recommend the Ideal Tech Stack** tailored to your team's skills and timeframe.
3. 🚀 **Generate a Crisp MVP Feature Scope** (Must-Haves vs Traps to skip).
4. ⏱️ **Build an Hour-by-Hour Execution Plan & Pitch Strategy** to impress judges.

> **Pro Tip:** You can upload problem statement PDFs, screenshots, or text files below, or customize the **Tournament Options** to tailor your strategy!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [criteria, setCriteria] = useState<Partial<TournamentCriteria>>({
    level: 'national',
    format: 'offline',
    timeframe: '36h',
    judgingFocus: 'innovation',
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<ProblemAnalysis[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hackathon_coach_saved_projects');
      if (saved) {
        setSavedProjects(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load saved projects', e);
    }
  }, []);

  const saveProjectToHistory = (analysis: ProblemAnalysis) => {
    setSavedProjects((prev) => {
      const exists = prev.some((p) => p.title.toLowerCase() === analysis.title.toLowerCase());
      if (exists) return prev;
      const updated = [analysis, ...prev].slice(0, 10);
      try {
        localStorage.setItem('hackathon_coach_saved_projects', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save projects', e);
      }
      return updated;
    });
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottomBtn(isFarFromBottom);
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isLoading]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    try {
      const processed = await Promise.all(files.map((file) => processFile(file)));
      setAttachments((prev) => [...prev, ...processed]);
    } catch (err) {
      console.error('File upload error:', err);
      setErrorMsg('Failed to process uploaded file.');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend && attachments.length === 0) return;

    setErrorMsg(null);
    const userMsgId = `user-${Date.now()}`;
    const newMsg: CoachMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      attachments: [...attachments],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput('');
    const currentAttachments = [...attachments];
    setAttachments([]);
    setIsLoading(true);

    try {
      const res = await sendCoachMessage(updatedMessages, criteria, currentAttachments);
      
      if (res.analysis) {
        saveProjectToHistory(res.analysis);
      }

      const assistantMsg: CoachMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: res.text,
        analysis: res.analysis,
        comparison: res.comparison,
        meta: res.meta,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setErrorMsg('Error contacting Coach API. Using fallback analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome-1',
        role: 'assistant',
        content: `### 🏆 Welcome back to HACK-COACH AI!
        
Chat reset! Ready to analyze new problem statements or craft your next winning hackathon strategy.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setAttachments([]);
    setErrorMsg(null);
  };

  const hasStartedChat = messages.length > 1;

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-800 overflow-hidden font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      
      {/* Floating Sidebar Toggle Button for Desktop when Collapsed */}
      <div className={`hidden lg:flex fixed top-4 left-4 z-50 transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button 
          onClick={() => setIsSidebarCollapsed(false)} 
          className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
          title="Open Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      <CoachSidebar 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        criteria={criteria}
        setCriteria={setCriteria}
        isLoading={isLoading}
        handleSend={handleSend}
        savedProjects={savedProjects}
        setMessages={setMessages}
        resetChat={resetChat}
      />

      {/* Main Chat / Assistant Area — uses flex-col, children fill remaining height */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-transparent z-10">
        
        {/* Ambient Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full opacity-30 z-0 pointer-events-none"
          src="https://cdn.dribbble.com/userupload/17757529/file/original-5768722f106d1ac990ff28b2246e8e09.mp4"
        />

        {!hasStartedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto w-full custom-scrollbar relative z-10">
            
            {/* Minimalist AMOLED Orb/Icon */}
            <div className="w-24 h-24 rounded-full bg-white border border-gray-200 mb-8 flex items-center justify-center relative overflow-hidden shadow-sm">
              <Image src="/coach-avatar.png" alt="Coach Avatar" width={96} height={96} className="w-full h-full object-cover" />
            </div>

            {/* Greeting */}
            <h2 className="text-lg md:text-xl text-slate-500 font-semibold mb-2">Hi, Hacker</h2>
            <h1 className="text-3xl md:text-5xl text-slate-900 font-bold mb-4 tracking-tight text-center">How can I help today?</h1>
            <p className="text-slate-500 mb-10 text-sm text-center max-w-md">I'm here to help — from quick answers to smart recommendations.</p>

            {/* Centered Input Box */}
            <div className="w-full max-w-2xl mb-12">
              <CoachChatInput 
                input={input}
                setInput={setInput}
                attachments={attachments}
                removeAttachment={removeAttachment}
                handleKeyDown={handleKeyDown}
                handleFileUpload={handleFileUpload}
                fileInputRef={fileInputRef}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                isLoading={isLoading}
                handleSend={handleSend}
              />
            </div>

            {/* AMOLED Suggestion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl pb-12">
              <button onClick={() => handleSend('Compare 3 Problem Statements & pick the best winner')} className="p-5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-left transition-all group shadow-sm">
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm mb-2 group-hover:text-indigo-600">
                  <Scale className="w-4 h-4 text-slate-400" /> Compare
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Analyze multiple problem statements to find the winning edge.</p>
              </button>

              <button onClick={() => handleSend('Recommend Tech Stack for 24-hour hackathon')} className="p-5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-left transition-all group shadow-sm">
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm mb-2 group-hover:text-indigo-600">
                  <Zap className="w-4 h-4 text-slate-400" /> Tech Stack
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Get an optimized architecture for 24h rapid building.</p>
              </button>

              <button onClick={() => handleSend('Generate MVP Feature Roadmap (Must-Haves vs Traps)')} className="p-5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-left transition-all group shadow-sm">
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm mb-2 group-hover:text-indigo-600">
                  <FileText className="w-4 h-4 text-slate-400" /> Feature Scope
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Define the exact MVP features to build versus traps to avoid.</p>
              </button>
            </div>
          </div>
        ) : (
          // Active Chat Layout — absolute positioning for guaranteed scroll
          <div className="flex-1 relative z-10">
            {/* Scrollable messages area — fills space above input */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="absolute inset-0 bottom-[140px] overflow-y-scroll px-4 md:px-8 py-8 space-y-6 custom-scrollbar"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-5xl mx-auto ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 shrink-0 mt-2 border border-gray-200 overflow-hidden shadow-sm">
                      <Image src="/coach-avatar.png" alt="Coach Avatar" width={28} height={28} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {msg.role === 'user' ? (
                    /* User message — clean pill */
                    <div className="max-w-[75%] bg-indigo-600 text-white rounded-3xl px-5 py-3 shadow-sm">
                      <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                      <span className="text-[10px] text-white/70 mt-1 block text-right">{msg.timestamp}</span>
                    </div>
                  ) : (
                    /* AI message — laser border + italic serif */
                    <div className="laser-border max-w-[90%] bg-white rounded-2xl border border-gray-200 overflow-visible shadow-sm">
                      {/* Header */}
                      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">HACK-COACH</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          {msg.meta?.latencyMs && <span>{(msg.meta.latencyMs / 1000).toFixed(1)}s</span>}
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>

                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-5 pt-3">
                          {msg.attachments.map((att, i) => (
                            <div key={i} className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-slate-600 flex items-center gap-1.5">
                              {att.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                              <span className="truncate max-w-[140px]">{att.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Message body — italic serif */}
                      <div
                        className="px-5 py-4 prose prose-slate max-w-none prose-p:text-slate-700 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-li:text-slate-700 text-[15px] leading-[1.85]"
                        style={{ fontFamily: '"Georgia", "Times New Roman", serif', fontStyle: 'italic' }}
                      >
                        <MarkdownRenderer content={msg.content} />
                      </div>

                      {/* Cards */}
                      {msg.comparison && (
                        <div className="px-4 pb-4">
                          <ComparisonMatrix comparison={msg.comparison} />
                        </div>
                      )}
                      {msg.analysis && (
                        <div className="px-4 pb-4">
                          <ProblemCard analysis={msg.analysis} />
                        </div>
                      )}
                    </div>
                  )}

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mt-2 shadow-sm">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 items-center max-w-4xl mx-auto">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 animate-pulse border border-indigo-200">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 text-sm text-slate-600 flex items-center gap-3 shadow-sm">
                    <Sparkles className="w-4 h-4 animate-pulse text-indigo-500" />
                    <span>Analyzing strategy...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Fixed bottom input bar */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4 pt-2">
              {errorMsg && (
                <div className="p-3 mb-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center gap-2 max-w-5xl mx-auto">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div className="w-full max-w-6xl mx-auto">
                <CoachChatInput 
                  input={input}
                  setInput={setInput}
                  attachments={attachments}
                  removeAttachment={removeAttachment}
                  handleKeyDown={handleKeyDown}
                  handleFileUpload={handleFileUpload}
                  fileInputRef={fileInputRef}
                  mobileMenuOpen={mobileMenuOpen}
                  setMobileMenuOpen={setMobileMenuOpen}
                  isLoading={isLoading}
                  handleSend={handleSend}
                />
              </div>
            </div>

            {showScrollBottomBtn && (
              <button
                onClick={() => scrollToBottom('smooth')}
                className="absolute bottom-28 right-6 p-3 rounded-full bg-white hover:bg-gray-50 text-slate-700 shadow-lg transition-all duration-300 border border-gray-200 z-30 backdrop-blur-md"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </main>
      
      {/* Mobile overlay for sidebar */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-30 lg:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
