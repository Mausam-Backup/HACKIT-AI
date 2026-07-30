'use client';

import { IBehavioralMetrics } from '@/lib/xencruit-ai';
import { Activity, Eye, Zap, AlignCenter, Loader2 } from 'lucide-react';

interface AnalyticsDisplayProps {
  metrics: IBehavioralMetrics;
  isInitialized: boolean;
  error: string | null;
}

const METRICS = [
  { key: 'posture',     label: 'Posture',   Icon: AlignCenter },
  { key: 'focus',      label: 'Focus',     Icon: Eye },
  { key: 'engagement', label: 'Engage',    Icon: Zap },
  { key: 'symmetry',   label: 'Symmetry',  Icon: Activity },
] as const;

function barColor(v: number) {
  if (v >= 80) return 'bg-emerald-400';
  if (v >= 60) return 'bg-amber-400';
  return 'bg-rose-400';
}
function textColor(v: number) {
  if (v >= 80) return 'text-emerald-400';
  if (v >= 60) return 'text-amber-400';
  return 'text-rose-400';
}

export function AnalyticsDisplay({ metrics, isInitialized, error }: AnalyticsDisplayProps) {
  if (!isInitialized && !error) {
    return (
      <div className="px-3 py-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl flex items-center gap-2">
        <Loader2 className="w-3 h-3 text-violet-400 animate-spin shrink-0" />
        <span className="text-[11px] text-slate-400">Initializing AI…</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="px-3 py-2 bg-black/80 backdrop-blur-xl border border-rose-500/20 rounded-xl">
        <span className="text-[11px] text-rose-400">Vision unavailable</span>
      </div>
    );
  }

  const sentimentOk = metrics.sentiment === 'Positive';

  return (
    <div className="bg-black/85 backdrop-blur-xl border border-white/12 rounded-xl overflow-hidden shadow-xl w-52">

      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.08]">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Posture AI</span>
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sentimentOk ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span className={`text-[10px] font-semibold ${sentimentOk ? 'text-emerald-400' : 'text-amber-400'}`}>
            {metrics.sentiment}
          </span>
        </div>
      </div>

      {/* Rows */}
      <div className="px-3.5 py-3 space-y-3">
        {METRICS.map(({ key, label, Icon }) => {
          const value = Math.round((metrics as any)[key] ?? 0);
          return (
            <div key={key}>
              {/* Label row */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3 h-3 text-white/40" strokeWidth={1.8} />
                  <span className="text-[11px] text-white/70 font-medium">{label}</span>
                </div>
                <span className={`text-[11px] font-bold tabular-nums ${textColor(value)}`}>{value}%</span>
              </div>
              {/* Track */}
              <div className="h-[2px] bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor(value)}`}
                  style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
