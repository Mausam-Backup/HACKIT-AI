'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, AlertCircle, ArrowLeft, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface ReplayNode {
  id: string;
  timestamp: number;
  question: string;
  answer: string;
  quality: 'strong' | 'okay' | 'weak';
  score: number;
  analysis: string;
  duration: number;
  aiFeedback: string;
}

interface InterviewReplayProps {
  nodes: ReplayNode[];
  overallScore: number;
  onClose: () => void;
  onRetry: () => void;
}

export const InterviewReplay: React.FC<InterviewReplayProps> = ({
  nodes,
  overallScore,
  onClose,
  onRetry,
}) => {
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(0);
  const activeNode = nodes[selectedNodeIndex] || nodes[0];

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'strong':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Strong Response</span>;
      case 'okay':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Average</span>;
      default:
        return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Needs Work</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Replay Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Button variant="secondary" size="sm" onClick={onClose} className="bg-slate-800 text-slate-200 hover:bg-slate-700">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Executive Summary
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Interactive Timeline Analysis</span>
          <Button size="sm" onClick={onRetry} className="bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400">
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Practice Again
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Selector Column */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Questions Timeline</h4>
          <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {nodes.map((node, idx) => {
              const isSelected = idx === selectedNodeIndex;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeIndex(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500/80 text-white shadow-lg'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-400">Question #{idx + 1}</span>
                    {getQualityBadge(node.quality)}
                  </div>
                  <p className="text-xs font-medium line-clamp-2">{node.question}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {node.duration}s
                    </span>
                    <span className="font-bold text-cyan-400">{node.score}/100</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Question Detail View */}
        <div className="lg:col-span-7 space-y-4">
          {activeNode && (
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 space-y-5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">Question</div>
                  <h3 className="text-base font-bold text-slate-100">{activeNode.question}</h3>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Transcribed Response</div>
                  <p className="text-xs text-slate-200 leading-relaxed italic">"{activeNode.answer}"</p>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    AI Critique & STAR Evaluation
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{activeNode.analysis}</p>
                  
                  <div className="pt-3 border-t border-slate-800/80">
                    <div className="text-[11px] font-bold text-amber-400 mb-1">Key Actionable Coaching:</div>
                    <p className="text-xs text-slate-300 italic">{activeNode.aiFeedback}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
