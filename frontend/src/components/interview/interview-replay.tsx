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
        return <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Strong Response</span>;
      case 'okay':
        return <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Average</span>;
      default:
        return <span className="bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Needs Work</span>;
    }
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Replay Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <Button variant="outline" size="sm" onClick={onClose} className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Executive Summary
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Interactive Timeline Analysis</span>
          <Button size="sm" onClick={onRetry} className="bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-sm">
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Practice Again
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Selector Column */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Questions Timeline</h4>
          <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {nodes.map((node, idx) => {
              const isSelected = idx === selectedNodeIndex;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeIndex(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-300 text-slate-900 shadow-sm ring-1 ring-indigo-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>Question #{idx + 1}</span>
                    {getQualityBadge(node.quality)}
                  </div>
                  <p className={`text-xs font-semibold line-clamp-2 ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{node.question}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" /> {node.duration}s
                    </span>
                    <span className={`font-bold ${isSelected ? 'text-indigo-600' : 'text-slate-700'}`}>{node.score}/100</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Question Detail View */}
        <div className="lg:col-span-7 space-y-4">
          {activeNode && (
            <Card className="bg-white border-slate-200 shadow-md rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-5">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 mb-1.5">Question</div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{activeNode.question}</h3>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Your Transcribed Response</div>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{activeNode.answer}"</p>
                </div>

                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    AI Critique & STAR Evaluation
                  </div>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">{activeNode.analysis}</p>
                  
                  <div className="pt-3 border-t border-indigo-200/60">
                    <div className="text-[11px] font-bold text-indigo-700 mb-1 uppercase tracking-wider">Key Actionable Coaching:</div>
                    <p className="text-sm font-semibold text-slate-800 italic">{activeNode.aiFeedback}</p>
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

