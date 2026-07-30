'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Zap, MessageSquare, Brain, 
  CheckCircle2, RotateCcw, Move,
  Lightbulb, Sparkles, AlertTriangle, Activity, Quote
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { InterviewReplay } from './interview-replay';
import { InterviewAnalysis } from '@/services/groq-analysis';

interface DemoFeedbackProps {
  onRestart: () => void;
  analysis?: InterviewAnalysis | null;
}

const mockTimelineNodes = [
  {
    id: '1', timestamp: 45, quality: 'strong' as const, score: 90, duration: 65,
    question: "Tell me about yourself.", answer: "I'm a full-stack engineer...",
    analysis: "Excellent introduction.", aiFeedback: "Quantify metrics."
  }
];

export const DemoFeedback: React.FC<DemoFeedbackProps> = ({ onRestart, analysis }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showReplay, setShowReplay] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('tech'); 
  const [selectedSubNode, setSelectedSubNode] = useState<string>('l5');

  // Dynamic Draggable Positions State with Sexy Curved Arc Alignment
  const [orbPos, setOrbPos] = useState({ x: 12, y: 50 });
  const [catPositions, setCatPositions] = useState<Record<string, { x: number; y: number }>>({
    comm: { x: 27.5, y: 18 },
    tech: { x: 31.0, y: 34 },
    prob: { x: 32.5, y: 50 }, // Apex of curve!
    code: { x: 31.0, y: 66 },
    exec: { x: 27.5, y: 82 },
  });
  const [subNodePositions, setSubNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [radarPos, setRadarPos] = useState({ x: 81, y: 50 });

  const overallScore = analysis
    ? Math.round(analysis.overall_score * 100)
    : 84;

  const categories = [
    { id: 'comm', name: 'Communication', count: 4, score: Math.round((analysis?.communication_score || 0.78) * 100), icon: MessageSquare, defaultX: 27.5, defaultY: 18, tag: 'Articulation & Tone', color: '#AAC9CE', bgTint: '#AAC9CE20', textDark: '#1e383c' },
    { id: 'tech', name: 'Technical Depth', count: 5, score: Math.round((analysis?.technical_score || 0.85) * 100), icon: Brain, defaultX: 31.0, defaultY: 34, tag: 'Architecture & State', color: '#B6B4C2', bgTint: '#B6B4C220', textDark: '#2a2838' },
    { id: 'prob', name: 'Problem Solving', count: 3, score: Math.round((analysis?.problem_solving_score || 0.82) * 100), icon: Lightbulb, defaultX: 32.5, defaultY: 50, tag: 'Logic & Algorithmic', color: '#C9BBC8', bgTint: '#C9BBC820', textDark: '#362735' },
    { id: 'code', name: 'Code Execution', count: 3, score: Math.round((analysis?.code_quality_score || 0.80) * 100), icon: Trophy, defaultX: 31.0, defaultY: 66, tag: 'Complexity Bounds', color: '#E5C1CD', bgTint: '#E5C1CD20', textDark: '#3f252f' },
    { id: 'exec', name: 'Executive Poise', count: 3, score: 89, icon: Zap, defaultX: 27.5, defaultY: 82, tag: 'STAR & Presence', color: '#F3DBCF', bgTint: '#F3DBCF25', textDark: '#452d21' },
  ];

  const leafMap: Record<string, Array<{ 
    id: string; label: string; sub: string; status: 'success' | 'warning'; score: number;
    quote: string;
    radar: Array<{ attribute: string; score: number; benchmark: number }>;
  }>> = {
    comm: [
      { id: 'l1', label: 'Filler Word Frequency', sub: '3.2% Rate (Optimal)', status: 'warning', score: 72, quote: 'Occasional filler pause during system design questions.', radar: [{ attribute: 'Fluency', score: 72, benchmark: 80 }, { attribute: 'Tone', score: 85, benchmark: 75 }, { attribute: 'Pacing', score: 78, benchmark: 70 }, { attribute: 'Clarity', score: 82, benchmark: 75 }, { attribute: 'Pauses', score: 70, benchmark: 80 }, { attribute: 'Poise', score: 88, benchmark: 82 }] },
      { id: 'l2', label: 'Vocal Modulation & Tone', sub: 'Confident & Steady', status: 'success', score: 88, quote: 'Dynamic pitch variation maintained high interviewer engagement.', radar: [{ attribute: 'Fluency', score: 88, benchmark: 80 }, { attribute: 'Tone', score: 92, benchmark: 75 }, { attribute: 'Pacing', score: 85, benchmark: 70 }, { attribute: 'Clarity', score: 90, benchmark: 75 }, { attribute: 'Pauses', score: 86, benchmark: 80 }, { attribute: 'Poise', score: 94, benchmark: 82 }] },
      { id: 'l3', label: 'Pacing Rate (WPM)', sub: '145 WPM (Optimal)', status: 'success', score: 85, quote: 'Ideal cadence for complex technical explanations.', radar: [{ attribute: 'Fluency', score: 85, benchmark: 80 }, { attribute: 'Tone', score: 84, benchmark: 75 }, { attribute: 'Pacing', score: 95, benchmark: 70 }, { attribute: 'Clarity', score: 88, benchmark: 75 }, { attribute: 'Pauses', score: 82, benchmark: 80 }, { attribute: 'Poise', score: 86, benchmark: 82 }] },
      { id: 'l4', label: 'Active Listening Pauses', sub: '2.1s Avg Pause', status: 'success', score: 90, quote: 'Thoughtful pauses before answering behavioral scenarios.', radar: [{ attribute: 'Fluency', score: 90, benchmark: 80 }, { attribute: 'Tone', score: 88, benchmark: 75 }, { attribute: 'Pacing', score: 82, benchmark: 70 }, { attribute: 'Clarity', score: 92, benchmark: 75 }, { attribute: 'Pauses', score: 96, benchmark: 80 }, { attribute: 'Poise', score: 90, benchmark: 82 }] },
    ],
    tech: [
      { id: 'l5', label: 'System Architecture', sub: 'Microservices Design', status: 'success', score: 92, quote: 'Clear separation of concern between auth, API gateway and billing services.', radar: [{ attribute: 'Scalability', score: 94, benchmark: 75 }, { attribute: 'Security', score: 90, benchmark: 80 }, { attribute: 'Isolation', score: 92, benchmark: 78 }, { attribute: 'Caching', score: 88, benchmark: 70 }, { attribute: 'Resilience', score: 95, benchmark: 82 }, { attribute: 'Modularity', score: 96, benchmark: 80 }] },
      { id: 'l6', label: 'State Management', sub: 'React 19 Signals', status: 'success', score: 89, quote: 'Deep understanding of fine-grained reactive state isolation.', radar: [{ attribute: 'Scalability', score: 88, benchmark: 75 }, { attribute: 'Security', score: 85, benchmark: 80 }, { attribute: 'Isolation', score: 94, benchmark: 78 }, { attribute: 'Caching', score: 86, benchmark: 70 }, { attribute: 'Resilience', score: 90, benchmark: 82 }, { attribute: 'Modularity', score: 92, benchmark: 80 }] },
      { id: 'l7', label: 'Database Indexing', sub: 'B-Tree Scaling', status: 'success', score: 86, quote: 'Articulated composite index optimization and query execution plans.', radar: [{ attribute: 'Scalability', score: 90, benchmark: 75 }, { attribute: 'Security', score: 82, benchmark: 80 }, { attribute: 'Isolation', score: 86, benchmark: 78 }, { attribute: 'Caching', score: 92, benchmark: 70 }, { attribute: 'Resilience', score: 84, benchmark: 82 }, { attribute: 'Modularity', score: 85, benchmark: 80 }] },
      { id: 'l8', label: 'API Security & OAuth', sub: 'JWT + PKCE Tokens', status: 'success', score: 90, quote: 'Robust explanation of OAuth token rotation and PKCE verification flow.', radar: [{ attribute: 'Scalability', score: 86, benchmark: 75 }, { attribute: 'Security', score: 98, benchmark: 80 }, { attribute: 'Isolation', score: 90, benchmark: 78 }, { attribute: 'Caching', score: 80, benchmark: 70 }, { attribute: 'Resilience', score: 92, benchmark: 82 }, { attribute: 'Modularity', score: 88, benchmark: 80 }] },
      { id: 'l9', label: 'Latency Optimization', sub: 'CDN Edge Caching', status: 'success', score: 87, quote: 'Used stale-while-revalidate headers effectively to minimize RTT latency.', radar: [{ attribute: 'Scalability', score: 92, benchmark: 75 }, { attribute: 'Security', score: 80, benchmark: 80 }, { attribute: 'Isolation', score: 84, benchmark: 78 }, { attribute: 'Caching', score: 98, benchmark: 70 }, { attribute: 'Resilience', score: 88, benchmark: 82 }, { attribute: 'Modularity', score: 86, benchmark: 80 }] },
    ],
    prob: [
      { id: 'l10', label: 'Algorithmic Decomposition', sub: 'Step-by-step', status: 'success', score: 88, quote: 'Broke complex graph traversal into clear sub-problems.', radar: [{ attribute: 'Logic', score: 90, benchmark: 75 }, { attribute: 'Decomposition', score: 94, benchmark: 80 }, { attribute: 'Efficiency', score: 86, benchmark: 78 }, { attribute: 'Edge Cases', score: 82, benchmark: 70 }, { attribute: 'Structure', score: 88, benchmark: 82 }, { attribute: 'Speed', score: 85, benchmark: 80 }] },
      { id: 'l11', label: 'Edge Case Handling', sub: 'Null & Overflow', status: 'warning', score: 75, quote: 'Missed potential overflow check in integer summation.', radar: [{ attribute: 'Logic', score: 78, benchmark: 75 }, { attribute: 'Decomposition', score: 80, benchmark: 80 }, { attribute: 'Efficiency', score: 82, benchmark: 78 }, { attribute: 'Edge Cases', score: 68, benchmark: 70 }, { attribute: 'Structure', score: 75, benchmark: 82 }, { attribute: 'Speed', score: 72, benchmark: 80 }] },
      { id: 'l12', label: 'Trade-off Evaluation', sub: 'Memory vs Time', status: 'success', score: 85, quote: 'Weighed hash map memory overhead against lookup speed.', radar: [{ attribute: 'Logic', score: 88, benchmark: 75 }, { attribute: 'Decomposition', score: 86, benchmark: 80 }, { attribute: 'Efficiency', score: 90, benchmark: 78 }, { attribute: 'Edge Cases', score: 80, benchmark: 70 }, { attribute: 'Structure', score: 85, benchmark: 82 }, { attribute: 'Speed', score: 84, benchmark: 80 }] },
    ],
    code: [
      { id: 'l13', label: 'Big-O Complexity Bounds', sub: 'O(N log N) Time', status: 'success', score: 88, quote: 'Accurately derived logarithmic sorting bounds.', radar: [{ attribute: 'Time-O', score: 92, benchmark: 80 }, { attribute: 'Space-O', score: 88, benchmark: 75 }, { attribute: 'Syntax', score: 90, benchmark: 82 }, { attribute: 'DRY', score: 84, benchmark: 70 }, { attribute: 'Safety', score: 86, benchmark: 80 }, { attribute: 'Testing', score: 82, benchmark: 75 }] },
      { id: 'l14', label: 'Clean Code Modularization', sub: 'DRY Principles', status: 'success', score: 86, quote: 'Helper functions kept primary logic clean.', radar: [{ attribute: 'Time-O', score: 86, benchmark: 80 }, { attribute: 'Space-O', score: 84, benchmark: 75 }, { attribute: 'Syntax', score: 92, benchmark: 82 }, { attribute: 'DRY', score: 96, benchmark: 70 }, { attribute: 'Safety', score: 88, benchmark: 80 }, { attribute: 'Testing', score: 85, benchmark: 75 }] },
      { id: 'l15', label: 'Memory Allocation', sub: 'Zero Leaks', status: 'success', score: 90, quote: 'Proper cleanup of WebSocket event listeners.', radar: [{ attribute: 'Time-O', score: 88, benchmark: 80 }, { attribute: 'Space-O', score: 94, benchmark: 75 }, { attribute: 'Syntax', score: 88, benchmark: 82 }, { attribute: 'DRY', score: 86, benchmark: 70 }, { attribute: 'Safety', score: 95, benchmark: 80 }, { attribute: 'Testing', score: 90, benchmark: 75 }] },
    ],
    exec: [
      { id: 'l16', label: 'STAR Framework Alignment', sub: 'Structured Impact', status: 'success', score: 91, quote: 'Delivered quantifiable business impact in Result phase.', radar: [{ attribute: 'Situation', score: 90, benchmark: 80 }, { attribute: 'Task', score: 92, benchmark: 78 }, { attribute: 'Action', score: 94, benchmark: 82 }, { attribute: 'Result', score: 96, benchmark: 75 }, { attribute: 'Poise', score: 88, benchmark: 80 }, { attribute: 'Impact', score: 95, benchmark: 82 }] },
      { id: 'l17', label: 'Eye Contact & Alignment', sub: '92% Engagement', status: 'success', score: 92, quote: 'Maintained steady camera alignment throughout explanations.', radar: [{ attribute: 'Situation', score: 88, benchmark: 80 }, { attribute: 'Task', score: 90, benchmark: 78 }, { attribute: 'Action', score: 92, benchmark: 82 }, { attribute: 'Result', score: 90, benchmark: 75 }, { attribute: 'Poise', score: 98, benchmark: 80 }, { attribute: 'Impact', score: 92, benchmark: 82 }] },
      { id: 'l18', label: 'Executive Leadership Poise', sub: 'High Authority', status: 'success', score: 89, quote: 'Handled challenging architecture pushback with calm poise.', radar: [{ attribute: 'Situation', score: 90, benchmark: 80 }, { attribute: 'Task', score: 88, benchmark: 78 }, { attribute: 'Action', score: 90, benchmark: 82 }, { attribute: 'Result', score: 92, benchmark: 75 }, { attribute: 'Poise', score: 96, benchmark: 80 }, { attribute: 'Impact', score: 94, benchmark: 82 }] },
    ]
  };

  const activeCategoryObj = selectedCategory ? categories.find(c => c.id === selectedCategory) : null;
  const activeLeaves = selectedCategory ? (leafMap[selectedCategory] || []) : [];
  const activeSubNodeObj = activeLeaves.find(l => l.id === selectedSubNode) || activeLeaves[0] || leafMap.tech[0];

  // Calculate spacious curved arc positions for active Level 3 sub-containers
  const activeLeafNodes = activeLeaves.map((item, idx) => {
    const total = activeLeaves.length;
    const spacing = Math.min(17, 68 / Math.max(1, total));
    const startY = 50 - ((total - 1) * spacing / 2);
    const defaultY = startY + idx * spacing;
    // Sexy curved arc formula for sub-nodes!
    const curveOffset = total > 1 ? Math.sin((idx / (total - 1)) * Math.PI) * 4.5 : 0;
    const defaultX = 52.5 + curveOffset;
    const customPos = subNodePositions[item.id] || { x: defaultX, y: defaultY };
    return { ...item, x: customPos.x, y: customPos.y };
  });

  const activeConnectedLeafNode = activeLeafNodes.find(l => l.id === selectedSubNode) || activeLeafNodes[0];

  const handleCategoryClick = (id: string) => {
    if (selectedCategory === id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(id);
      const firstLeaf = leafMap[id]?.[0];
      if (firstLeaf) setSelectedSubNode(firstLeaf.id);
    }
  };

  const startDrag = (
    e: React.MouseEvent, 
    initialPos: { x: number; y: number }, 
    updateFn: (newPos: { x: number; y: number }) => void
  ) => {
    if (!containerRef.current) return;
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const rect = containerRef.current.getBoundingClientRect();

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaXPercent = ((moveEvent.clientX - startX) / rect.width) * 100;
      const deltaYPercent = ((moveEvent.clientY - startY) / rect.height) * 100;
      const nextX = Math.max(4, Math.min(96, initialPos.x + deltaXPercent));
      const nextY = Math.max(4, Math.min(96, initialPos.y + deltaYPercent));
      updateFn({ x: nextX, y: nextY });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const resetPositions = () => {
    setOrbPos({ x: 12, y: 50 });
    setCatPositions({
      comm: { x: 27.5, y: 18 },
      tech: { x: 31.0, y: 34 },
      prob: { x: 32.5, y: 50 },
      code: { x: 31.0, y: 66 },
      exec: { x: 27.5, y: 82 },
    });
    setSubNodePositions({});
    setRadarPos({ x: 81, y: 50 });
  };

  if (showReplay) {
    return <InterviewReplay nodes={mockTimelineNodes} overallScore={overallScore} onClose={() => setShowReplay(false)} onRetry={onRestart} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-900 relative font-['Plus_Jakarta_Sans',sans-serif]">
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Space+Grotesk:wght@600;700&display=swap');
        .font-space { font-family: 'Space Grotesk', sans-serif; }
      `}</style>
      
      <div className="absolute top-5 left-8 z-40 flex items-center gap-4">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl px-4.5 py-2 shadow-[0_4px_20px_rgba(15,23,42,0.06)] flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-space font-bold text-sm text-slate-950 tracking-tight">Interactive Playable Canvas</span>
          <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider flex items-center gap-1">
            <Move className="w-3 h-3 text-indigo-500" /> Click & Drag any container
          </span>
        </div>
        <button onClick={resetPositions} className="bg-white/95 backdrop-blur-xl border border-slate-200/90 hover:bg-slate-50 rounded-2xl px-4 py-2 text-xs font-extrabold text-slate-700 transition-all flex items-center gap-2 shadow-sm">
          <RotateCcw className="w-3.5 h-3.5 text-indigo-600" /> Reset Layout
        </button>
      </div>

      {/* ── 100% Full Canvas Playable Network ── */}
      <div ref={containerRef} className="w-full h-full relative z-10 overflow-hidden bg-[#F8FAFC]">
        
        {/* Balanced Subtle Dot Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-38 pointer-events-none" />
        
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
          <defs>
            <linearGradient id="thinRainbowBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="25%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#db2777" />
              <stop offset="75%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {categories.map((cat) => {
            const isSel = cat.id === selectedCategory;
            const catPos = catPositions[cat.id] || { x: 30, y: cat.defaultY };
            const path = `M ${orbPos.x} ${orbPos.y} C ${(orbPos.x + catPos.x) / 2} ${orbPos.y}, ${(orbPos.x + catPos.x) / 2} ${catPos.y}, ${catPos.x} ${catPos.y}`;
            return (
              <g key={`orb-cat-${cat.id}`}>
                <path d={path} stroke={isSel ? cat.color : "#e2e8f0"} strokeWidth={isSel ? 0.09 : 0.05} strokeOpacity={isSel ? 1 : 0.4} fill="none" />
                {isSel && (
                  <motion.path 
                    d={path} 
                    stroke="url(#thinRainbowBeam)" 
                    strokeWidth={0.16} 
                    fill="none" 
                    strokeDasharray="0.04 0.15" 
                    pathLength={1} 
                    animate={{ strokeDashoffset: [0, -1] }} 
                    transition={{ duration: 1.0, repeat: Infinity, ease: "linear" }} 
                  />
                )}
              </g>
            );
          })}

          {activeCategoryObj && activeLeafNodes.map((leaf, idx) => {
            const isSubSel = leaf.id === selectedSubNode;
            const catPos = catPositions[activeCategoryObj.id] || { x: 30, y: 50 };
            const path = `M ${catPos.x} ${catPos.y} C ${(catPos.x + leaf.x) / 2} ${catPos.y}, ${(catPos.x + leaf.x) / 2} ${leaf.y}, ${leaf.x} ${leaf.y}`;
            return (
              <g key={`active-leaf-${leaf.id}`}>
                <path d={path} stroke={isSubSel ? activeCategoryObj.color : "#cbd5e1"} strokeWidth={isSubSel ? 0.1 : 0.05} fill="none" />
                <motion.path 
                  d={path} 
                  stroke="url(#thinRainbowBeam)" 
                  strokeWidth={0.15} 
                  strokeLinecap="round" 
                  strokeDasharray="0.03 0.12" 
                  pathLength={1} 
                  fill="none" 
                  animate={{ strokeDashoffset: [0, -1] }} 
                  transition={{ duration: 0.8 + (idx % 3) * 0.15, repeat: Infinity, ease: "linear", delay: idx * 0.03 }} 
                />
              </g>
            );
          })}

          {selectedCategory && activeCategoryObj && activeConnectedLeafNode && (
            <g key="leaf-to-radar">
              <path 
                d={`M ${activeConnectedLeafNode.x} ${activeConnectedLeafNode.y} C ${(activeConnectedLeafNode.x + radarPos.x) / 2} ${activeConnectedLeafNode.y}, ${(activeConnectedLeafNode.x + radarPos.x) / 2} ${radarPos.y}, ${radarPos.x} ${radarPos.y}`} 
                stroke={activeCategoryObj.color} 
                strokeWidth={0.1} 
                fill="none" 
              />
              <motion.path 
                d={`M ${activeConnectedLeafNode.x} ${activeConnectedLeafNode.y} C ${(activeConnectedLeafNode.x + radarPos.x) / 2} ${activeConnectedLeafNode.y}, ${(activeConnectedLeafNode.x + radarPos.x) / 2} ${radarPos.y}, ${radarPos.x} ${radarPos.y}`} 
                stroke="url(#thinRainbowBeam)" 
                strokeWidth={0.18} 
                strokeLinecap="round"
                strokeDasharray="0.04 0.15"
                pathLength={1}
                fill="none" 
                animate={{ strokeDashoffset: [0, -1] }} 
                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }} 
              />
            </g>
          )}
        </svg>

        {/* ── LEVEL 1: Central Score Hub (Ultra-Clean, Minimalist Human Executive Design) ── */}
        <div 
          onMouseDown={(e) => startDrag(e, orbPos, setOrbPos)}
          className="absolute z-20 flex flex-col items-center cursor-grab active:cursor-grabbing select-none" 
          style={{ left: `${orbPos.x}%`, top: `${orbPos.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative w-32 h-32 flex items-center justify-center group">
            {/* Elegant Circular Score Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="#E2E8F0" strokeWidth="4" fill="none" />
              <motion.circle 
                cx="50" 
                cy="50" 
                r="42" 
                stroke="#334155" 
                strokeWidth="4.5" 
                strokeLinecap="round" 
                fill="none" 
                strokeDasharray="263.89" 
                initial={{ strokeDashoffset: 263.89 }}
                animate={{ strokeDashoffset: 263.89 * (1 - overallScore / 100) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>

            {/* Inner Clean Glass Hub */}
            <div className="absolute inset-2 bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_10px_25px_rgba(15,23,42,0.06)] rounded-full flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-2xl font-space font-bold text-slate-950 tracking-tight">{overallScore}%</span>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">Overall</span>
            </div>
          </div>
          <div className="mt-2 text-center">
            <div className="text-xs font-space font-bold text-slate-900 tracking-tight">Executive Score</div>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none z-20">
          {categories.map((cat) => {
            const isSel = cat.id === selectedCategory;
            const Icon = cat.icon;
            const currentPos = catPositions[cat.id] || { x: 30, y: cat.defaultY };
            return (
              <div 
                key={cat.id} 
                onMouseDown={(e) => startDrag(e, currentPos, (newPos) => {
                  setCatPositions(prev => ({ ...prev, [cat.id]: newPos }));
                })}
                className="absolute pointer-events-auto cursor-grab active:cursor-grabbing select-none" 
                style={{ left: `${currentPos.x}%`, top: `${currentPos.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div 
                  onClick={() => handleCategoryClick(cat.id)} 
                  style={{
                    backgroundColor: isSel ? cat.color : '#FFFFFF',
                    borderColor: isSel ? cat.color : '#E2E8F0',
                    color: isSel ? cat.textDark : '#1E293B',
                    boxShadow: isSel ? `0 14px 35px ${cat.color}65` : '0 4px 12px rgba(15,23,42,0.05)'
                  }}
                  className={`w-[210px] rounded-2xl p-3.5 flex items-center justify-between border transition-all ${
                    isSel ? 'scale-105 font-bold ring-4 ring-black/5' : 'hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      style={{ 
                        backgroundColor: isSel ? 'rgba(255,255,255,0.4)' : cat.bgTint,
                        borderColor: isSel ? 'rgba(0,0,0,0.1)' : `${cat.color}60`,
                        color: isSel ? cat.textDark : '#334155'
                      }}
                      className="w-8.5 h-8.5 rounded-xl flex items-center justify-center border"
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold tracking-tight font-space">{cat.name}</div>
                      <div className="text-[9px] font-semibold mt-0.5 opacity-80">
                        {cat.count} Focus Nodes
                      </div>
                    </div>
                  </div>
                  <div 
                    style={{
                      backgroundColor: isSel ? 'rgba(255,255,255,0.4)' : '#F8FAFC',
                      borderColor: isSel ? 'rgba(0,0,0,0.1)' : '#E2E8F0',
                      color: isSel ? cat.textDark : '#0F172A'
                    }}
                    className="text-xs font-space font-extrabold px-2 py-0.5 rounded-lg border"
                  >
                    {cat.score}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── LEVEL 3: Active Focus Sub-Nodes (Colored out with Pastel Palette like Level 2!) ── */}
        <div className="absolute inset-0 pointer-events-none z-20">
          <AnimatePresence>
            {selectedCategory && activeCategoryObj && activeLeafNodes.map((leaf) => {
              const isSubSel = leaf.id === selectedSubNode;
              return (
                <div 
                  key={leaf.id} 
                  onMouseDown={(e) => startDrag(e, { x: leaf.x, y: leaf.y }, (newPos) => {
                    setSubNodePositions(prev => ({ ...prev, [leaf.id]: newPos }));
                  })}
                  className="absolute pointer-events-auto cursor-grab active:cursor-grabbing select-none" 
                  style={{ left: `${leaf.x}%`, top: `${leaf.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <motion.div 
                    onClick={() => setSelectedSubNode(leaf.id)}
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: isSubSel ? 1.05 : 1 }} 
                    exit={{ opacity: 0, scale: 0.98 }} 
                    whileHover={{ scale: 1.05 }} 
                    transition={{ duration: 0.12, ease: "easeOut" }} 
                    style={{
                      backgroundColor: isSubSel ? activeCategoryObj.color : `${activeCategoryObj.color}25`,
                      borderColor: isSubSel ? activeCategoryObj.color : `${activeCategoryObj.color}70`,
                      color: activeCategoryObj.textDark,
                      boxShadow: isSubSel ? `0 12px 30px ${activeCategoryObj.color}70` : '0 4px 12px rgba(15,23,42,0.04)'
                    }}
                    className={`w-[220px] rounded-2xl p-3.5 border cursor-pointer transition-all flex flex-col gap-1.5 ${
                      isSubSel ? 'ring-4 ring-black/5 font-bold scale-105' : 'hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="shrink-0">
                          {leaf.status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-800" />
                          )}
                        </div>
                        <div className="text-xs font-bold tracking-tight truncate font-space">
                          {leaf.label}
                        </div>
                      </div>
                      <div 
                        style={{
                          backgroundColor: isSubSel ? 'rgba(255,255,255,0.45)' : '#FFFFFF80',
                          borderColor: 'rgba(0,0,0,0.1)',
                          color: activeCategoryObj.textDark
                        }}
                        className="text-[10px] font-space font-extrabold px-2 py-0.5 rounded-lg border"
                      >
                        {leaf.score}%
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <div className="text-[9px] font-semibold truncate opacity-85">{leaf.sub}</div>
                      <div className="w-14 h-1.5 bg-black/10 rounded-full overflow-hidden shrink-0">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${leaf.score}%`,
                            backgroundColor: isSubSel ? '#1E293B' : activeCategoryObj.color
                          }} 
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {selectedCategory && activeCategoryObj && activeSubNodeObj && (
            <div 
              onMouseDown={(e) => startDrag(e, radarPos, setRadarPos)}
              className="absolute pointer-events-auto z-30 cursor-grab active:cursor-grabbing select-none" 
              style={{ left: `${radarPos.x}%`, top: `${radarPos.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                className="w-[330px] bg-white/95 backdrop-blur-xl border border-slate-200 shadow-[0_25px_60px_rgba(15,23,42,0.08)] rounded-3xl p-5 flex flex-col gap-3.5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div 
                      style={{ backgroundColor: `${activeCategoryObj.color}35`, color: activeCategoryObj.textDark }}
                      className="w-8 h-8 rounded-xl border border-slate-200/50 flex items-center justify-center"
                    >
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-space font-bold text-slate-950 tracking-tight truncate max-w-[170px]">
                        {activeSubNodeObj.label}
                      </div>
                      <div className="text-[9px] font-extrabold uppercase tracking-widest mt-0.5 text-slate-500">
                        Competency Polygon
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-space font-bold text-slate-950">{activeSubNodeObj.score}%</div>
                    <div className="text-[8px] font-extrabold text-emerald-600 uppercase tracking-widest">Rating</div>
                  </div>
                </div>

                <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-2.5 relative overflow-hidden flex flex-col items-center">
                  <div className="w-full flex items-center justify-between px-2 pt-1">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Multi-Axis Vector</span>
                    <span 
                      style={{ backgroundColor: `${activeCategoryObj.color}25`, borderColor: `${activeCategoryObj.color}60`, color: activeCategoryObj.textDark }}
                      className="text-[9px] font-extrabold px-2 py-0.5 rounded border"
                    >
                      +8.4% Benchmark
                    </span>
                  </div>

                  <div className="h-48 w-full mt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="68%" data={activeSubNodeObj.radar}>
                        <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                        <PolarAngleAxis dataKey="attribute" tick={{ fill: '#334155', fontSize: 9, fontWeight: 800 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 7, fill: '#94a3b8' }} />
                        <Radar name="Candidate" dataKey="score" stroke={activeCategoryObj.color} fill={activeCategoryObj.color} fillOpacity={0.45} strokeWidth={2.5} />
                        <Radar name="Benchmark" dataKey="benchmark" stroke="#059669" fill="#10b981" fillOpacity={0.15} strokeWidth={1.5} strokeDasharray="3 3" />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-slate-600 pb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: activeCategoryObj.color }} /> Candidate
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Benchmark
                    </div>
                  </div>
                </div>

                <div 
                  style={{ backgroundColor: `${activeCategoryObj.color}18`, borderColor: `${activeCategoryObj.color}40` }}
                  className="border rounded-2xl p-3 text-slate-800"
                >
                  <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest mb-1 text-slate-700">
                    <Quote className="w-3 h-3 text-slate-600" /> AI Executive Insight
                  </div>
                  <p className="text-[11px] leading-relaxed font-semibold text-slate-700">
                    "{activeSubNodeObj.quote}"
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
};
