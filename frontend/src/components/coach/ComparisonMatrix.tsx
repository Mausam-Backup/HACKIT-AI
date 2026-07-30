"use client";

import React from 'react';
import { ProblemComparisonMatrix } from '@/services/coach-service';
import { Trophy, CheckCircle2, ShieldAlert, Zap, Award, Flame, Sparkles, Scale } from 'lucide-react';

interface ComparisonMatrixProps {
  comparison: ProblemComparisonMatrix;
}

export default function ComparisonMatrix({ comparison }: ComparisonMatrixProps) {
  return (
    <div className="w-full bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 md:p-6 space-y-5 text-neutral-100 shadow-2xl overflow-hidden relative">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
                {comparison.comparisonTitle}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/10">
                Side-by-Side Matrix
              </span>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Comparative scoring across win potential, technical risk, effort, and judge appeal
            </p>
          </div>
        </div>
      </div>

      {/* Winner Spotlight Banner */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0 mt-0.5">
          <Trophy className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-white">
            RECOMMENDED WINNER: {comparison.winnerTitle}
          </span>
          <p className="text-xs text-white/80 font-medium leading-relaxed mt-0.5">
            {comparison.summaryVerdict}
          </p>
        </div>
      </div>

      {/* Comparison Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {comparison.items.map((item, idx) => {
          const isWinner = item.title.toLowerCase().includes(comparison.winnerTitle.toLowerCase()) || idx === 0;
          return (
            <div
              key={item.id || idx}
              className={`rounded-xl p-4 space-y-3.5 border transition-all ${
                isWinner
                  ? 'bg-black border-white/20 shadow-lg'
                  : 'bg-transparent border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isWinner ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/20 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-white" /> WINNER #1
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/50">
                      Option #{idx + 1}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-white/40 uppercase">Win Score</span>
                  <div className="text-xl font-black text-white leading-none">
                    {item.winScore}<span className="text-xs font-normal text-white/40">/100</span>
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white">{item.title}</h4>

              {/* Metrics Table */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-white/5 p-2.5 rounded-lg border border-white/10">
                <div>
                  <span className="text-white/40 text-[10px]">Feasibility:</span>
                  <div className="font-semibold text-white/90">{item.feasibility}</div>
                </div>
                <div>
                  <span className="text-white/40 text-[10px]">Sprint Time:</span>
                  <div className="font-semibold text-white/90">{item.effortHours} Hours</div>
                </div>
                <div>
                  <span className="text-white/40 text-[10px]">WOW Factor:</span>
                  <div className="font-semibold text-white/90">{item.wowFactor}</div>
                </div>
                <div>
                  <span className="text-white/40 text-[10px]">Tech Risk:</span>
                  <div className="font-semibold text-white/90">
                    {item.techRisk}
                  </div>
                </div>
              </div>

              <p className="text-xs text-white/60 italic border-l-2 border-white/20 pl-2">
                "{item.verdict}"
              </p>

              <div className="pt-1 text-[11px] font-medium text-white/40 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-white/50" />
                <span>{item.recommendedRole}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
