import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Zap, MessageSquare, Brain, 
  CheckCircle2, RotateCcw, Move,
  Lightbulb, Sparkles, AlertTriangle, Activity, Quote
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { InterviewReplay, ReplayNode } from './interview-replay';
import { InterviewAnalysis } from '@/services/groq-analysis';

interface DemoFeedbackProps {
  onRestart: () => void;
  analysis?: InterviewAnalysis | null;
  history?: Array<{ role: string; content: string }>;
}

function buildDynamicLeafMap(analysis: InterviewAnalysis | null | undefined) {
  const commScore = Math.round((analysis?.communication_score ?? 0.85) * 100);
  const techScore = Math.round((analysis?.technical_score ?? 0.82) * 100);
  const probScore = Math.round((analysis?.problem_solving_score ?? 0.84) * 100);
  const codeScore = Math.round((analysis?.code_quality_score ?? 0.80) * 100);
  const overallScore = analysis
    ? Math.round(analysis.overall_score * 100)
    : Math.round((commScore + techScore + probScore + codeScore) / 4);
  const execScore = Math.round((commScore * 0.4) + (overallScore * 0.6));

  const strengths = analysis?.strengths || [];
  const weaknesses = analysis?.weaknesses || [];
  const recs = analysis?.recommendations || [];
  const issues = analysis?.detected_issues || [];

  const getQuote = (fallback: string, index: number = 0) => {
    if (issues.length > index && issues[index]?.context) return issues[index].context;
    if (strengths.length > index && strengths[index]) return strengths[index];
    if (weaknesses.length > index && weaknesses[index]) return weaknesses[index];
    if (analysis?.summary) return analysis.summary;
    return fallback;
  };

  const clampScore = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
  const calcNodeScore = (base: number, offset: number = 0) => base === 0 ? 0 : clampScore(base + offset);

  const commLeaves = [
    {
      id: 'l1',
      label: 'Speech Fluency & Pacing',
      sub: issues.some(i => i.issue_type === 'filler_words') ? `${issues.find(i => i.issue_type === 'filler_words')?.count || 4} Filler pauses` : (commScore < 50 ? 'Brevity & Fluency Issues' : 'Fluent & Steady Pace'),
      status: (commScore >= 75 && !issues.some(i => i.issue_type === 'filler_words')) ? 'success' as const : 'warning' as const,
      score: calcNodeScore(commScore, -2),
      quote: getQuote('Speech cadence and pauses evaluated across interview turns.', 0),
      radar: [
        { attribute: 'Fluency', score: calcNodeScore(commScore), benchmark: 80 },
        { attribute: 'Tone', score: calcNodeScore(commScore, 3), benchmark: 75 },
        { attribute: 'Pacing', score: calcNodeScore(commScore, -4), benchmark: 70 },
        { attribute: 'Clarity', score: calcNodeScore(commScore, 2), benchmark: 75 },
        { attribute: 'Pauses', score: calcNodeScore(commScore, -5), benchmark: 80 },
        { attribute: 'Poise', score: calcNodeScore(commScore, 4), benchmark: 82 },
      ]
    },
    {
      id: 'l2',
      label: 'Vocal Modulation & Tone',
      sub: commScore < 50 ? 'Unprofessional/Brief Tone' : 'Professional Tone',
      status: commScore >= 75 ? 'success' as const : 'warning' as const,
      score: calcNodeScore(commScore, 3),
      quote: strengths[0] || 'Vocal modulation and tone evaluated across turns.',
      radar: [
        { attribute: 'Fluency', score: calcNodeScore(commScore, 2), benchmark: 80 },
        { attribute: 'Tone', score: calcNodeScore(commScore, 4), benchmark: 75 },
        { attribute: 'Pacing', score: calcNodeScore(commScore), benchmark: 70 },
        { attribute: 'Clarity', score: calcNodeScore(commScore, 3), benchmark: 75 },
        { attribute: 'Pauses', score: calcNodeScore(commScore), benchmark: 80 },
        { attribute: 'Poise', score: calcNodeScore(commScore, 5), benchmark: 82 },
      ]
    },
    {
      id: 'l3',
      label: 'Response Conciseness',
      sub: recs[0] || 'Structured answers',
      status: commScore >= 75 ? 'success' as const : 'warning' as const,
      score: calcNodeScore(commScore),
      quote: weaknesses[0] || recs[0] || 'Conciseness evaluated across candidate turn durations.',
      radar: [
        { attribute: 'Fluency', score: calcNodeScore(commScore), benchmark: 80 },
        { attribute: 'Tone', score: calcNodeScore(commScore), benchmark: 75 },
        { attribute: 'Pacing', score: calcNodeScore(commScore, 2), benchmark: 70 },
        { attribute: 'Clarity', score: calcNodeScore(commScore, 4), benchmark: 75 },
        { attribute: 'Pauses', score: calcNodeScore(commScore, -2), benchmark: 80 },
        { attribute: 'Poise', score: calcNodeScore(commScore, 2), benchmark: 82 },
      ]
    }
  ];

  const techLeaves = [
    {
      id: 'l4',
      label: 'Architecture & Concepts',
      sub: techScore < 50 ? 'Lacks Architecture Detail' : 'System Design Principles',
      status: techScore >= 75 ? 'success' as const : 'warning' as const,
      score: calcNodeScore(techScore, 2),
      quote: strengths.find(s => s.toLowerCase().includes('tech') || s.toLowerCase().includes('arch')) || analysis?.summary || 'Demonstrated understanding of core technical domain concepts.',
      radar: [
        { attribute: 'Scalability', score: calcNodeScore(techScore, 3), benchmark: 75 },
        { attribute: 'Security', score: calcNodeScore(techScore), benchmark: 80 },
        { attribute: 'Isolation', score: calcNodeScore(techScore, 2), benchmark: 78 },
        { attribute: 'Caching', score: calcNodeScore(techScore, -3), benchmark: 70 },
        { attribute: 'Resilience', score: calcNodeScore(techScore, 1), benchmark: 82 },
        { attribute: 'Modularity', score: calcNodeScore(techScore, 4), benchmark: 80 },
      ]
    },
    {
      id: 'l5',
      label: 'Technical Depth',
      sub: techScore < 50 ? 'Minimal Domain Concepts' : 'Domain Knowledge',
      status: techScore >= 75 ? 'success' as const : 'warning' as const,
      score: calcNodeScore(techScore),
      quote: getQuote('Technical concepts evaluated during response turns.', 1),
      radar: [
        { attribute: 'Scalability', score: calcNodeScore(techScore), benchmark: 75 },
        { attribute: 'Security', score: calcNodeScore(techScore, 2), benchmark: 80 },
        { attribute: 'Isolation', score: calcNodeScore(techScore), benchmark: 78 },
        { attribute: 'Caching', score: calcNodeScore(techScore, 2), benchmark: 70 },
        { attribute: 'Resilience', score: calcNodeScore(techScore, -2), benchmark: 82 },
        { attribute: 'Modularity', score: calcNodeScore(techScore, 2), benchmark: 80 },
      ]
    },
    {
      id: 'l6',
      label: 'Trade-off Analysis',
      sub: techScore < 50 ? 'No Trade-offs Discussed' : 'Design Considerations',
      status: techScore >= 75 ? 'success' as const : 'warning' as const,
      score: calcNodeScore(techScore, -3),
      quote: weaknesses[1] || recs[1] || 'Evaluated trade-offs and alternative implementation approaches.',
      radar: [
        { attribute: 'Scalability', score: calcNodeScore(techScore, 2), benchmark: 75 },
        { attribute: 'Security', score: calcNodeScore(techScore, -3), benchmark: 80 },
        { attribute: 'Isolation', score: calcNodeScore(techScore, 1), benchmark: 78 },
        { attribute: 'Caching', score: calcNodeScore(techScore, 4), benchmark: 70 },
        { attribute: 'Resilience', score: calcNodeScore(techScore, -2), benchmark: 82 },
        { attribute: 'Modularity', score: calcNodeScore(techScore), benchmark: 80 },
      ]
    }
  ];

  const probLeaves = [
    {
      id: 'l7',
      label: 'Logical Decomposition',
      sub: probScore < 50 ? 'No Problem Decomposition' : 'Step-by-step reasoning',
      status: probScore >= 75 ? 'success' as const : 'warning' as const,
      score: calcNodeScore(probScore, 2),
      quote: strengths[1] || 'Broke down problem constraints effectively.',
      radar: [
        { attribute: 'Logic', score: calcNodeScore(probScore, 4), benchmark: 75 },
        { attribute: 'Decomposition', score: calcNodeScore(probScore, 5), benchmark: 80 },
        { attribute: 'Efficiency', score: calcNodeScore(probScore), benchmark: 78 },
        { attribute: 'Edge Cases', score: calcNodeScore(probScore, -4), benchmark: 70 },
        { attribute: 'Structure', score: calcNodeScore(probScore, 2), benchmark: 82 },
        { attribute: 'Speed', score: calcNodeScore(probScore, -1), benchmark: 80 },
      ]
    },
    {
      id: 'l8',
      label: 'Edge Case & Constraint Handling',
      sub: probScore < 50 ? 'No Constraints Evaluated' : 'Boundary verification',
      status: probScore >= 75 ? 'success' as const : 'warning' as const,
      score: calcNodeScore(probScore, -4),
      quote: weaknesses.find(w => w.toLowerCase().includes('case') || w.toLowerCase().includes('clarifying')) || recs[2] || 'Considered edge cases and initial system constraints.',
      radar: [
        { attribute: 'Logic', score: calcNodeScore(probScore), benchmark: 75 },
        { attribute: 'Decomposition', score: calcNodeScore(probScore, 2), benchmark: 80 },
        { attribute: 'Efficiency', score: calcNodeScore(probScore, 3), benchmark: 78 },
        { attribute: 'Edge Cases', score: calcNodeScore(probScore, -6), benchmark: 70 },
        { attribute: 'Structure', score: calcNodeScore(probScore, -2), benchmark: 82 },
        { attribute: 'Speed', score: calcNodeScore(probScore, -3), benchmark: 80 },
      ]
    }
  ];

  const codeLeaves = [
    {
      id: 'l9',
      label: 'Implementation Quality',
      sub: codeScore < 50 ? 'No Code Provided' : 'Clean Code & Syntax',
      status: codeScore >= 75 ? 'success' as const : 'warning' as const,
      score: calcNodeScore(codeScore),
      quote: analysis?.detailed_feedback || 'Evaluated candidate code modularity and logic structure.',
      radar: [
        { attribute: 'Time-O', score: calcNodeScore(codeScore, 3), benchmark: 80 },
        { attribute: 'Space-O', score: calcNodeScore(codeScore), benchmark: 75 },
        { attribute: 'Syntax', score: calcNodeScore(codeScore, 4), benchmark: 82 },
        { attribute: 'DRY', score: calcNodeScore(codeScore, -2), benchmark: 70 },
        { attribute: 'Safety', score: calcNodeScore(codeScore, 1), benchmark: 80 },
        { attribute: 'Testing', score: calcNodeScore(codeScore, -4), benchmark: 75 },
      ]
    },
    {
      id: 'l10',
      label: 'Algorithmic Complexity',
      sub: codeScore < 50 ? 'No Bounds Analysis' : 'Big-O Space & Time',
      status: codeScore >= 75 ? 'success' as const : 'warning' as const,
      score: calcNodeScore(codeScore, 3),
      quote: 'Derived time and space complexity bounds for proposed solution.',
      radar: [
        { attribute: 'Time-O', score: calcNodeScore(codeScore, 5), benchmark: 80 },
        { attribute: 'Space-O', score: calcNodeScore(codeScore, 3), benchmark: 75 },
        { attribute: 'Syntax', score: calcNodeScore(codeScore), benchmark: 82 },
        { attribute: 'DRY', score: calcNodeScore(codeScore, -3), benchmark: 70 },
        { attribute: 'Safety', score: calcNodeScore(codeScore, 2), benchmark: 80 },
        { attribute: 'Testing', score: calcNodeScore(codeScore, -3), benchmark: 75 },
      ]
    }
  ];

  const execLeaves = [
    {
      id: 'l11',
      label: 'STAR Framework Alignment',
      sub: execScore < 50 ? 'No STAR Structure' : 'Structured Responses',
      status: execScore >= 75 ? 'success' as const : 'warning' as const,
      score: calcNodeScore(execScore),
      quote: recs.find(r => r.toLowerCase().includes('star')) || 'Structured situational answers using clear Situation-Task-Action-Result format.',
      radar: [
        { attribute: 'Situation', score: calcNodeScore(execScore), benchmark: 80 },
        { attribute: 'Task', score: calcNodeScore(execScore, 2), benchmark: 78 },
        { attribute: 'Action', score: calcNodeScore(execScore, 3), benchmark: 82 },
        { attribute: 'Result', score: calcNodeScore(execScore, 4), benchmark: 75 },
        { attribute: 'Poise', score: calcNodeScore(execScore), benchmark: 80 },
        { attribute: 'Impact', score: calcNodeScore(execScore, 2), benchmark: 82 },
      ]
    },
    {
      id: 'l12',
      label: 'Executive Leadership & Poise',
      sub: execScore < 50 ? 'Unprofessional/Low Poise' : 'Professional Confidence',
      status: execScore >= 75 ? 'success' as const : 'warning' as const,
      score: calcNodeScore(execScore),
      quote: strengths.find(s => s.toLowerCase().includes('poise') || s.toLowerCase().includes('calm') || s.toLowerCase().includes('engagement')) || 'Maintained professional composure and steady communication.',
      radar: [
        { attribute: 'Situation', score: calcNodeScore(execScore), benchmark: 80 },
        { attribute: 'Task', score: calcNodeScore(execScore, 1), benchmark: 78 },
        { attribute: 'Action', score: calcNodeScore(execScore, 2), benchmark: 82 },
        { attribute: 'Result', score: calcNodeScore(execScore), benchmark: 75 },
        { attribute: 'Poise', score: calcNodeScore(execScore, 3), benchmark: 80 },
        { attribute: 'Impact', score: calcNodeScore(execScore, 2), benchmark: 82 },
      ]
    }
  ];

  return {
    comm: commLeaves,
    tech: techLeaves,
    prob: probLeaves,
    code: codeLeaves,
    exec: execLeaves
  };
}

function buildDynamicTimelineNodes(
  history?: Array<{ role: string; content: string }>,
  analysis?: InterviewAnalysis | null
): ReplayNode[] {
  if (!history || history.length === 0) {
    return [
      {
        id: 'tn-1',
        timestamp: 30,
        quality: 'strong' as const,
        score: Math.round((analysis?.overall_score ?? 0.82) * 100),
        duration: 45,
        question: "Describe a technical challenge you solved recently.",
        answer: analysis?.summary || "I led the architecture and implementation of our real-time processing pipeline.",
        analysis: analysis?.detailed_feedback || "Clear technical breakdown with good logical structure.",
        aiFeedback: analysis?.recommendations?.[0] || "Quantify specific system impact metrics."
      }
    ];
  }

  const nodes: ReplayNode[] = [];
  let questionIndex = 1;

  for (let i = 0; i < history.length; i++) {
    const msg = history[i];
    if (msg.role === 'user' || msg.role === 'candidate') {
      const promptMsg = history[i - 1];
      const question = (promptMsg && promptMsg.role !== 'user' && promptMsg.role !== 'candidate')
        ? promptMsg.content
        : `Interview Question #${questionIndex}`;
      
      const words = msg.content.trim().split(/\s+/).length;
      const turnScore = Math.min(98, Math.max(55, Math.round(
        (analysis ? analysis.overall_score * 100 : 80) + (words > 25 ? 5 : -5)
      )));

      nodes.push({
        id: `tn-${questionIndex}`,
        timestamp: questionIndex * 45,
        question: question.length > 120 ? question.slice(0, 120) + '...' : question,
        answer: msg.content,
        quality: turnScore >= 84 ? 'strong' : turnScore >= 72 ? 'okay' : 'weak',
        score: turnScore,
        duration: Math.max(12, Math.round(words / 2.2)),
        analysis: analysis?.detailed_feedback || `Response of ${words} words evaluated against core competency rubrics.`,
        aiFeedback: analysis?.recommendations?.[(questionIndex - 1) % (analysis.recommendations.length || 1)] || 'Focus on structured STAR format answers.'
      });

      questionIndex++;
    }
  }

  if (nodes.length === 0) {
    nodes.push({
      id: 'tn-1',
      timestamp: 30,
      quality: 'strong',
      score: Math.round((analysis?.overall_score ?? 0.82) * 100),
      duration: 30,
      question: "Interview Discussion",
      answer: history.map(h => h.content).join(' ').slice(0, 200) || "Candidate response transcript",
      analysis: analysis?.summary || "Evaluation completed.",
      aiFeedback: analysis?.recommendations?.[0] || "Continue practicing structured responses."
    });
  }

  return nodes;
}

export const DemoFeedback: React.FC<DemoFeedbackProps> = ({ onRestart, analysis, history }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showReplay, setShowReplay] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('tech'); 
  const [selectedSubNode, setSelectedSubNode] = useState<string>('l4');

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

  const leafMap = useMemo(() => buildDynamicLeafMap(analysis), [analysis]);
  const timelineNodes = useMemo(() => buildDynamicTimelineNodes(history, analysis), [history, analysis]);

  const commScore = Math.round((analysis?.communication_score ?? 0.85) * 100);
  const techScore = Math.round((analysis?.technical_score ?? 0.82) * 100);
  const probScore = Math.round((analysis?.problem_solving_score ?? 0.84) * 100);
  const codeScore = Math.round((analysis?.code_quality_score ?? 0.80) * 100);
  const overallScore = analysis
    ? Math.round(analysis.overall_score * 100)
    : Math.round((commScore + techScore + probScore + codeScore) / 4);
  const execScore = Math.round((commScore * 0.4) + (overallScore * 0.6));

  const categories = [
    { id: 'comm', name: 'Communication', count: leafMap.comm.length, score: commScore, icon: MessageSquare, defaultX: 27.5, defaultY: 18, tag: 'Articulation & Tone', color: '#AAC9CE', bgTint: '#AAC9CE20', textDark: '#1e383c' },
    { id: 'tech', name: 'Technical Depth', count: leafMap.tech.length, score: techScore, icon: Brain, defaultX: 31.0, defaultY: 34, tag: 'Architecture & Logic', color: '#B6B4C2', bgTint: '#B6B4C220', textDark: '#2a2838' },
    { id: 'prob', name: 'Problem Solving', count: leafMap.prob.length, score: probScore, icon: Lightbulb, defaultX: 32.5, defaultY: 50, tag: 'Logic & Algorithmic', color: '#C9BBC8', bgTint: '#C9BBC820', textDark: '#362735' },
    { id: 'code', name: 'Code Execution', count: leafMap.code.length, score: codeScore, icon: Trophy, defaultX: 31.0, defaultY: 66, tag: 'Execution Bounds', color: '#E5C1CD', bgTint: '#E5C1CD20', textDark: '#3f252f' },
    { id: 'exec', name: 'Executive Poise', count: leafMap.exec.length, score: execScore, icon: Zap, defaultX: 27.5, defaultY: 82, tag: 'STAR & Presence', color: '#F3DBCF', bgTint: '#F3DBCF25', textDark: '#452d21' },
  ];

  const activeCategoryObj = selectedCategory ? categories.find(c => c.id === selectedCategory) : null;
  const activeLeaves = selectedCategory ? ((leafMap as Record<string, any[]>)[selectedCategory] || []) : [];
  const activeSubNodeObj = activeLeaves.find((l: any) => l.id === selectedSubNode) || activeLeaves[0] || leafMap.tech[0];

  const radarAvgScore = useMemo(() => {
    if (!activeSubNodeObj?.radar || activeSubNodeObj.radar.length === 0) return 0;
    const sum = activeSubNodeObj.radar.reduce((acc: number, item: any) => acc + item.score, 0);
    return Math.round(sum / activeSubNodeObj.radar.length);
  }, [activeSubNodeObj]);

  const radarAvgBenchmark = useMemo(() => {
    if (!activeSubNodeObj?.radar || activeSubNodeObj.radar.length === 0) return 75;
    const sum = activeSubNodeObj.radar.reduce((acc: number, item: any) => acc + item.benchmark, 0);
    return Math.round(sum / activeSubNodeObj.radar.length);
  }, [activeSubNodeObj]);

  const benchmarkDiff = radarAvgScore - radarAvgBenchmark;
  const benchmarkDiffText = benchmarkDiff >= 0 
    ? `+${benchmarkDiff.toFixed(1)}% vs Benchmark` 
    : `${benchmarkDiff.toFixed(1)}% vs Benchmark`;

  // Calculate spacious curved arc positions for active Level 3 sub-containers
  const activeLeafNodes = activeLeaves.map((item: any, idx: number) => {
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

  const activeConnectedLeafNode = activeLeafNodes.find((l: any) => l.id === selectedSubNode) || activeLeafNodes[0];

  const handleCategoryClick = (id: string) => {
    if (selectedCategory === id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(id);
      const categoryLeaves = (leafMap as Record<string, any[]>)[id];
      const firstLeaf = categoryLeaves?.[0];
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
    return (
      <div className="h-screen w-screen overflow-auto bg-slate-950 p-6">
        <InterviewReplay
          nodes={timelineNodes}
          overallScore={overallScore}
          onClose={() => setShowReplay(false)}
          onRetry={onRestart}
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-900 relative font-['Plus_Jakarta_Sans',sans-serif]">
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Space+Grotesk:wght@600;700&display=swap');
        .font-space { font-family: 'Space Grotesk', sans-serif; }
      `}</style>
      
      <div className="absolute top-5 left-8 z-40 flex items-center gap-3">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl px-4.5 py-2 shadow-[0_4px_20px_rgba(15,23,42,0.06)] flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-space font-bold text-sm text-slate-950 tracking-tight">Interactive Playable Canvas</span>
          <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider flex items-center gap-1">
            <Move className="w-3 h-3 text-indigo-500" /> Click & Drag any container
          </span>
        </div>
        <button 
          onClick={() => setShowReplay(true)} 
          className="bg-white/95 backdrop-blur-xl border border-slate-200/90 hover:bg-slate-50 rounded-2xl px-4 py-2 text-xs font-extrabold text-slate-800 transition-all flex items-center gap-2 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Questions Timeline
        </button>
        <button onClick={resetPositions} className="bg-white/95 backdrop-blur-xl border border-slate-200/90 hover:bg-slate-50 rounded-2xl px-4 py-2 text-xs font-extrabold text-slate-700 transition-all flex items-center gap-2 shadow-sm">
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Reset Layout
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

          {activeCategoryObj && activeLeafNodes.map((leaf: any, idx: number) => {
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
            {selectedCategory && activeCategoryObj && activeLeafNodes.map((leaf: any) => {
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
                    <div className={`text-[8px] font-extrabold uppercase tracking-widest ${activeSubNodeObj.score >= 70 ? 'text-emerald-600' : activeSubNodeObj.score > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {activeSubNodeObj.score >= 70 ? 'Competent' : activeSubNodeObj.score > 0 ? 'Needs Work' : 'Critical Deficit'}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-2.5 relative overflow-hidden flex flex-col items-center">
                  <div className="w-full flex items-center justify-between px-2 pt-1">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Multi-Axis Vector</span>
                    <span 
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${
                        benchmarkDiff >= 0 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {benchmarkDiffText}
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
