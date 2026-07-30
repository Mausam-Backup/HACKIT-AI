'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Play, ArrowLeft, Loader2, PhoneOff, Code2, Video, Mic, Activity, Sparkles, Clock, Wifi
} from 'lucide-react';
import { toast } from 'sonner';
import { useVapi } from '@/hooks/use-vapi';
import { analyzeInterview, InterviewAnalysis } from '@/services/groq-analysis';
import { DemoFeedback } from '@/components/interview/demo-feedback';

const UserCamera = dynamic(
  () => import('@/components/interview/user-camera').then((mod) => mod.UserCamera),
  { ssr: false }
);

const VapiVisualizer = dynamic(
  () => import('@/components/interview/vapi-visualizer').then((mod) => mod.VapiVisualizer),
  { ssr: false }
);

const TranscriptionDisplay = dynamic(
  () => import('@/components/interview/vapi-transcription-display').then((mod) => mod.TranscriptionDisplay),
  { ssr: false }
);

const Sandbox = dynamic(
  () => import('@/components/interview/sandbox').then((mod) => mod.Sandbox),
  { ssr: false }
);

export default function ActiveInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params?.id ? String(params.id) : '1';

  const [activeTab, setActiveTab] = useState<'interview' | 'coding'>('interview');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<InterviewAnalysis | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const {
    isCallActive,
    isThinking,
    isSpeaking,
    volumeLevel,
    lastTranscript,
    messages: vapiMessages,
    startCall,
    endCall,
    toggleCall,
    error: vapiError,
  } = useVapi();

  // Session timer
  useEffect(() => {
    if (!isCallActive) return;
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [isCallActive]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleEndCallAndAnalyze = async () => {
    endCall();
    setIsAnalyzing(true);
    toast.info('Generating AI Executive Performance Report...');

    try {
      const history = vapiMessages.map((m: any) => ({
        role: m.role || 'user',
        content: m.transcript || m.content || m.message || ''
      }));

      const result = await analyzeInterview(history, `Practice Session #${interviewId}`);
      setAnalysisData(result);
      setShowFeedback(true);
      toast.success('Interview analysis ready!');
    } catch (e) {
      console.error(e);
      toast.error('Loading evaluation report...');
      setShowFeedback(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (showFeedback) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-white">
        <DemoFeedback
          analysis={analysisData}
          onRestart={() => {
            setShowFeedback(false);
            setAnalysisData(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-purple-500/30 overflow-hidden">

      {/* ── Top Bar ── */}
      <header className="h-14 shrink-0 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl px-5 flex items-center justify-between z-30">

        {/* Left — exit + room name */}
        <div className="flex items-center gap-3">
          <Link href="/interviews">
            <button className="group h-8 px-3 rounded-lg bg-black/[0.04] hover:bg-black/[0.08] text-slate-600 hover:text-black text-xs font-semibold border border-black/[0.07] transition-all flex items-center gap-1.5">
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
              Exit
            </button>
          </Link>

          <div className="h-4 w-px bg-black/10" />

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block absolute inset-0 animate-ping opacity-60" />
            </div>
            <span className="text-xs font-semibold text-black/80">Room #{interviewId}</span>
            <span className="text-[10px] text-black/40 font-mono">· AI Interview Session</span>
          </div>
        </div>

        {/* Center — tab switcher */}
        <div className="absolute left-1/2 -translate-x-1/2 flex p-0.5 rounded-xl bg-black/[0.04] border border-black/[0.07]">
          <button
            onClick={() => setActiveTab('interview')}
            className={`h-7 px-4 rounded-[10px] text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'interview'
                ? 'bg-white text-black shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Video className="w-3 h-3" />
            Interview
          </button>
          <button
            onClick={() => setActiveTab('coding')}
            className={`h-7 px-4 rounded-[10px] text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'coding'
                ? 'bg-white text-black shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Code2 className="w-3 h-3" />
            Code Sandbox
          </button>
        </div>

        {/* Right — timer + actions */}
        <div className="flex items-center gap-2">
          {isCallActive && (
            <div className="flex items-center gap-1.5 px-3 h-7 rounded-lg bg-black/[0.04] border border-black/[0.07] text-[11px] font-mono text-slate-600">
              <Clock className="w-3 h-3" />
              {formatTime(elapsed)}
            </div>
          )}

          {!isCallActive ? (
            <button
              onClick={startCall}
              className="h-8 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_28px_rgba(139,92,246,0.5)] transition-all flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 fill-current" />
              Start Session
            </button>
          ) : (
            <button
              onClick={handleEndCallAndAnalyze}
              disabled={isAnalyzing}
              className="h-8 px-4 rounded-xl bg-rose-500/90 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-[0_0_16px_rgba(244,63,94,0.3)]"
            >
              {isAnalyzing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <PhoneOff className="w-3 h-3" />
              )}
              End & Evaluate
            </button>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-hidden p-4">
        {activeTab === 'interview' ? (
          <div className="h-full grid grid-cols-12 gap-4">

            {/* Left — AI + Transcript */}
            <div className="col-span-5 flex flex-col gap-4 min-h-0">
              <VapiVisualizer
                isSpeaking={isSpeaking}
                isThinking={isThinking}
                volumeLevel={volumeLevel}
              />
              <div className="flex-1 min-h-0">
                <TranscriptionDisplay
                  messages={vapiMessages}
                  lastTranscript={lastTranscript}
                />
              </div>
            </div>

            {/* Right — Camera */}
            <div className="col-span-7 min-h-0">
              <UserCamera isActive={true} enableAnalytics={true} />
            </div>
          </div>
        ) : (
          <div className="h-full">
            <Sandbox />
          </div>
        )}
      </main>
    </div>
  );
}
