'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Trash2, Sparkles, ArrowRight, ChevronDown, X
} from 'lucide-react';
import { toast } from 'sonner';
import FloatingNav from '@/components/ui/FloatingNav';
import Footer from '@/components/landing/Footer';
import Aurora from '@/components/ui/Aurora';
import HorizontalScroll from '@/components/interview/HorizontalScroll';

interface Interview {
  id: number;
  title: string;
  type: string;
  role: string;
  difficulty: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  turn_count: number;
}

const STORAGE_KEY = 'ai_saas_interviews';

const getStoredInterviews = (): Interview[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return [];
};

const saveInterviews = (interviews: Interview[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews));
  }
};

export default function InterviewsPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRole, setNewRole] = useState('Full Stack Developer');
  const [newType, setNewType] = useState('Behavioral & Technical');
  const [newDifficulty, setNewDifficulty] = useState('Medium');
  const [openDiff, setOpenDiff] = useState(false);
  const [openFocus, setOpenFocus] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInterviews(getStoredInterviews());
  }, []);

  useEffect(() => {
    if (!isCreateOpen) { setVideoLoaded(false); return; }
    const v = modalVideoRef.current;
    if (!v) return;
    if (v.readyState >= 3) { setVideoLoaded(true); return; }
    const onCanPlay = () => setVideoLoaded(true);
    v.addEventListener('canplay', onCanPlay);
    return () => v.removeEventListener('canplay', onCanPlay);
  }, [isCreateOpen]);

  const handleCreate = () => {
    if (!newTitle.trim()) {
      toast.error('Please enter an interview title');
      return;
    }
    const newId = interviews.length > 0 ? Math.max(...interviews.map(i => i.id)) + 1 : 1;
    const item: Interview = {
      id: newId,
      title: newTitle.trim(),
      role: newRole,
      difficulty: newDifficulty,
      type: newType,
      status: 'pending',
      created_at: new Date().toISOString(),
      turn_count: 0
    };

    const updated = [item, ...interviews];
    setInterviews(updated);
    saveInterviews(updated);
    toast.success('Interview workspace initialized');
    setIsCreateOpen(false);
    setNewTitle('');
    router.push(`/interviews/${newId}`);
  };

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Remove "${title}"?`)) {
      const updated = interviews.filter(i => i.id !== id);
      setInterviews(updated);
      saveInterviews(updated);
      toast.success('Session deleted');
    }
  };

  return (
    <div className="text-slate-100 font-sans selection:bg-purple-500/30 selection:text-purple-200">
      <FloatingNav />

      <HorizontalScroll>
        {/* Section 1: Hero */}
        <div className="hs-section bg-light-blue">
          <div className="hs-divider"></div>
          <div className="hs-left">
            <h1 className="hs-main-title text-black">Master Your Interviews<br />with Real-Time<br />AI Coaching</h1>
            <div className="mt-auto flex items-center gap-2 text-xs font-bold font-mono tracking-widest text-black/70 mb-4">
              <Play className="w-3 h-3 fill-current" /> NEXT-GEN AI PREP & PROCTORING
            </div>
          </div>
          <div className="hs-right">
            <p className="hs-label text-black">01 / INTRODUCTION</p>
            <p className="hs-content text-black/80">
              Simulate high-stakes voice interviews, track posture using MediaPipe vision AI, and receive instant LLM transcripts. This innovation transforms the way you prepare for your career.
            </p>
            <div className="mt-8">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="group relative inline-flex items-center gap-4 px-8 py-4 rounded-full bg-black text-white font-bold text-sm hover:scale-105 transition-transform"
              >
                <span>Launch Mock Interview</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
          <p className="hs-title bottom-left">HERO</p>
        </div>

        {/* Section 2: Voice AI Feature */}
        <div className="hs-section bg-red">
          <div className="hs-divider"></div>
          <div className="hs-left">
            <h1 className="hs-main-title">Interactive<br />Voice AI</h1>
            <div className="mt-auto flex items-center gap-2 text-xs font-bold font-mono tracking-widest text-black/70 mb-4">
              <Play className="w-3 h-3 fill-current text-black/70" /> ULTRA-LOW LATENCY STT
            </div>
          </div>
          <div className="hs-right">
            <p className="hs-label text-black">02 / INTERACTIVE AI</p>
            <p className="hs-content text-black/80">
              Realistic two-way voice dialogue powered by ultra-low-latency STT, natural LLM responses, and real-time audio waveforms. Experience conversational latency under 500ms.
            </p>
          </div>
          <p className="hs-title bottom-left">VOICE</p>
        </div>

        {/* Section 3: Posture Proctoring Feature */}
        <div className="hs-section bg-black">
          <div className="hs-divider"></div>
          <div className="hs-left">
            <h1 className="hs-main-title text-[#A9E7FE]">Live Posture<br />Proctoring</h1>
            <div className="mt-auto flex items-center gap-2 text-xs font-bold font-mono tracking-widest text-[#A9E7FE]/50 mb-4">
              <Play className="w-3 h-3 fill-current text-[#A9E7FE]/50" /> CLIENT-SIDE MEDIAPIPE AI
            </div>
          </div>
          <div className="hs-right">
            <p className="hs-label" style={{ color: '#A9E7FE' }}>03 / LIVE PROCTORING</p>
            <p className="hs-content text-white/80">
              Client-side MediaPipe vision model tracks shoulder alignment, slouching, head focus angles, and eye contact to ensure you project confidence and professionalism.
            </p>
          </div>
          <p className="hs-title bottom-left">VISION</p>
        </div>

        {/* Section 4: STAR Review Feature */}
        <div className="hs-section bg-pink">
          <div className="hs-divider"></div>
          <div className="hs-left">
            <h1 className="hs-main-title text-white">Executive<br />STAR Review</h1>
            <div className="mt-auto flex items-center gap-2 text-xs font-bold font-mono tracking-widest text-white/70 mb-4">
              <Play className="w-3 h-3 fill-current text-white/70" /> 70B LLM TRANSCRIPTS
            </div>
          </div>
          <div className="hs-right">
            <p className="hs-label text-white">04 / EXECUTIVE REVIEW</p>
            <p className="hs-content text-white/80">
              Detailed transcript scoring, filler word counts, radar skill cards, and timeline analysis to pinpoint exactly where you can improve your behavioral answers.
            </p>
          </div>
          <p className="hs-title bottom-left">STAR</p>
        </div>

        {/* Section 5: Sessions List */}
        <div className="hs-section bg-black">
          <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
            <Aurora
              colorStops={["#6366f1", "#8b5cf6", "#d946ef"]}
              blend={0.6}
              amplitude={0.2}
              speed={0.3}
            />
          </div>
          <div className="hs-divider"></div>
          
          <div className="hs-left z-10 pointer-events-none relative">
            <h1 className="hs-main-title text-white pointer-events-auto mt-[10vh]">Your Interview<br />Workspaces</h1>
          </div>

          <div className="hs-right z-20 pointer-events-auto h-full flex flex-col justify-center">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 mt-12">
              <div>
                <p className="hs-label" style={{ color: '#d946ef' }}>05 / WORKSPACES</p>
                <p className="hs-content text-white/70" style={{ maxWidth: '400px' }}>
                  Select an interview room to begin your session or review past AI evaluations and transcript scores.
                </p>
              </div>
              <span className="text-sm font-semibold px-4 py-2 rounded-full bg-white/[0.05] border border-white/10 text-slate-300 whitespace-nowrap shrink-0">
                {interviews.length} Sessions Available
              </span>
            </div>
            
            <div className="flex flex-row gap-6 overflow-x-auto pb-4 custom-scrollbar w-full" style={{ scrollSnapType: 'x mandatory', marginTop: '2vh' }}>
              {interviews.map((session) => (
                <div
                  key={session.id}
                  className="group relative p-5 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl hover:border-purple-500/50 hover:bg-white/[0.04] transition-all duration-300 shadow-2xl flex flex-col justify-between shrink-0 w-[350px]"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {session.type}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-white/[0.05] text-slate-300 border border-white/10">
                          {session.role}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {session.difficulty}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDelete(session.id, session.title)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-xl hover:bg-rose-500/10 transition-colors"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors leading-tight">
                        {session.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Created on {new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${session.status === 'completed' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse'}`} />
                      <span className="text-xs font-semibold text-slate-300">
                        {session.status === 'completed' ? 'Evaluation Generated' : 'Ready to Start'}
                      </span>
                    </div>

                    <Link href={`/interviews/${session.id}`}>
                      <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-purple-600 hover:text-white text-slate-200 font-bold text-xs border border-white/10 transition-all duration-300 shadow-md">
                        <Play className="w-3 h-3 fill-current" />
                        <span>Enter Workspace</span>
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="hs-title bottom-left" style={{ opacity: 0.05, zIndex: 0, fontSize: '11vw' }}>SESSIONS</p>
        </div>
      </HorizontalScroll>

      {/* Footer remains outside the scroll context */}
      <div className="relative z-50 bg-[#07080c]">
        <Footer bgClass="bg-transparent" />
      </div>

      {/* Two-Column Light Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-2xl z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-3xl rounded-3xl overflow-hidden border border-violet-100 shadow-[0_32px_80px_rgba(139,92,246,0.15)] flex flex-row"
              style={{ minHeight: '520px' }}
            >
              {/* ── Corner Light Beams ── */}
              <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full bg-violet-300/40 blur-[60px] z-50" />
              <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-indigo-200/50 blur-[60px] z-50" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-indigo-300/30 blur-[60px] z-50" />
              <div className="pointer-events-none absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-violet-200/50 blur-[60px] z-50" />
              {/* Edge shimmer lines */}
              <div className="pointer-events-none absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent z-50" />
              <div className="pointer-events-none absolute bottom-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent z-50" />

              {/* ── LEFT PANEL — Dark Video ── */}
              <div className="relative w-[42%] flex-shrink-0 overflow-hidden border-r border-white/10">

                {/* ── Skeleton placeholder — amber/orange palette matching the video ── */}
                <AnimatePresence>
                  {!videoLoaded && (
                    <motion.div
                      key="vid-skeleton"
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 z-10 overflow-hidden bg-[#0d0a06]"
                    >
                      {/* Warm gradient base */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0e05] via-[#0d0a06] to-[#0a0d12]" />

                      {/* Animated amber glow bloom — center */}
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-amber-600/40 blur-3xl"
                      />
                      <motion.div
                        animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.30, 0.15] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-orange-500/30 blur-2xl"
                      />

                      {/* Shimmer sweep */}
                      <motion.div
                        animate={{ x: ['-120%', '220%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent skew-x-[-15deg]"
                      />

                      {/* Floating sparks */}
                      {[
                        { left: '25%', top: '35%', size: 3, delay: 0, color: 'bg-amber-400/60' },
                        { left: '65%', top: '25%', size: 4, delay: 0.6, color: 'bg-orange-300/50' },
                        { left: '50%', top: '60%', size: 3, delay: 1.1, color: 'bg-yellow-400/50' },
                        { left: '80%', top: '50%', size: 2, delay: 0.3, color: 'bg-amber-300/60' },
                        { left: '20%', top: '65%', size: 4, delay: 0.9, color: 'bg-orange-400/40' },
                      ].map((p, i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
                          transition={{ duration: 1.8 + i * 0.3, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                          className={`absolute rounded-full ${p.color}`}
                          style={{ left: p.left, top: p.top, width: p.size * 2, height: p.size * 2 }}
                        />
                      ))}

                      {/* Loading bar */}
                      <div className="absolute bottom-0 inset-x-0 h-px bg-amber-900/30">
                        <motion.div
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                          className="h-full w-1/2 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actual video */}
                <video
                  ref={modalVideoRef}
                  src="/assets/modal-video.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    videoLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Tiny branding dot */}
                <div className="absolute bottom-5 left-5 z-20">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/40 border border-purple-400/30 flex items-center justify-center shadow-[0_0_14px_rgba(168,85,247,0.5)]">
                    <Sparkles className="w-3 h-3 text-purple-300" />
                  </div>
                </div>
              </div>

              {/* ── RIGHT PANEL — Light Form ── */}
              <div className="flex-1 bg-white flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between px-7 pt-7 pb-5 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">New Session</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Configure your interview workspace</p>
                  </div>
                  <button
                    onClick={() => setIsCreateOpen(false)}
                    className="text-slate-300 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-all mt-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Fields */}
                <div className="flex-1 px-7 py-5 space-y-4 overflow-y-auto">
                  {/* Interview Title */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Interview Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Meta Senior Full Stack Engineer"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                    />
                  </div>

                  {/* Target Role */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                    />
                  </div>

                  {/* Difficulty Level — light pill selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Difficulty Level</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { val: 'Easy', label: 'Easy' },
                        { val: 'Medium', label: 'Mid' },
                        { val: 'Hard', label: 'Senior' },
                        { val: 'Expert', label: 'Expert' },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setNewDifficulty(opt.val)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                            newDifficulty === opt.val
                              ? 'bg-violet-600 border-violet-600 text-white shadow-[0_4px_14px_rgba(139,92,246,0.35)]'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interview Focus — light pill selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Interview Focus</label>
                    <div className="flex flex-col gap-2">
                      {[
                        { val: 'Behavioral & Technical', label: 'Behavioral & Technical' },
                        { val: 'System Design', label: 'System Design & Architecture' },
                        { val: 'Coding Challenge', label: 'Live Coding & Algorithms' },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setNewType(opt.val)}
                          className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-left transition-all border ${
                            newType === opt.val
                              ? 'bg-violet-50 border-violet-400 text-violet-700 shadow-[0_2px_10px_rgba(139,92,246,0.12)]'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-violet-200 hover:text-violet-600 hover:bg-violet-50/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-7 py-5 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Sparkles className="w-3 h-3 text-violet-400" />
                    <span>Powered by 70B LLM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCreateOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-700 text-xs font-semibold transition-all hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs overflow-hidden shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_28px_rgba(139,92,246,0.55)] transition-all hover:-translate-y-0.5"
                    >
                      <span className="relative z-10">Launch Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5 relative z-10 transition-transform group-hover:translate-x-0.5" />
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
