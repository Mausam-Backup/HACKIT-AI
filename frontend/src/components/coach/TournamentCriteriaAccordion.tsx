"use client";

import React, { useState } from 'react';
import { TournamentCriteria } from '@/services/coach-service';
import { 
  Trophy, 
  Sparkles, 
  Clock, 
  Users, 
  Target, 
  ChevronDown, 
  ChevronUp, 
  Globe, 
  Building2, 
  Laptop, 
  SlidersHorizontal
} from 'lucide-react';

interface TournamentCriteriaAccordionProps {
  criteria: Partial<TournamentCriteria>;
  onChange: (updated: Partial<TournamentCriteria>) => void;
  compact?: boolean;
}

export default function TournamentCriteriaAccordion({
  criteria,
  onChange,
  compact = false,
}: TournamentCriteriaAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeCount = Object.keys(criteria).filter(
    (k) => criteria[k as keyof TournamentCriteria] !== undefined && criteria[k as keyof TournamentCriteria] !== ''
  ).length;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm">
      {/* Header Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left hover:bg-gray-50 transition-colors group flex items-center justify-between ${
          compact ? 'px-4 py-3' : 'px-6 py-5'
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-slate-500 shrink-0 group-hover:scale-105 group-hover:border-cyan-500/30 group-hover:text-cyan-600 transition-all duration-300">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800 text-sm tracking-wide truncate">
                {compact ? 'Tournament Options' : 'Advanced Strategy Configuration'}
              </span>
              {activeCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                  {activeCount} set
                </span>
              )}
            </div>
            {!compact && (
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                Tailor guidance by scale, format, timeframe, and judging focus
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-cyan-600 shrink-0 ml-3 transition-colors">
          <span className="text-[10px] uppercase tracking-widest font-bold hidden sm:inline">
            {isOpen ? 'Hide' : 'Configure'}
          </span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className={`border-t border-gray-100 bg-transparent space-y-6 ${
          compact ? 'px-4 pb-5 pt-4' : 'px-6 pb-7 pt-5'
        }`}>
          <div className={`grid gap-6 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            
            {/* 1. Competition Level */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-bold text-cyan-700/70 flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-cyan-600/50 shrink-0" />
                Scale / Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'college', label: 'College' },
                  { id: 'state', label: 'State' },
                  { id: 'national', label: 'National' },
                  { id: 'global', label: 'Global' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      onChange({ ...criteria, level: item.id as TournamentCriteria['level'] })
                    }
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all border truncate ${
                      criteria.level === item.id
                        ? 'bg-cyan-50 border-cyan-300 text-cyan-700 shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-slate-500 hover:bg-gray-100 hover:border-gray-300 hover:text-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Format / Mode */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-bold text-cyan-700/70 flex items-center gap-2">
                <Laptop className="w-3.5 h-3.5 text-cyan-600/50 shrink-0" />
                Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'offline', label: 'In-Person', icon: Building2 },
                  { id: 'online', label: 'Remote', icon: Globe },
                  { id: 'hybrid', label: 'Hybrid', icon: Sparkles },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        onChange({ ...criteria, format: item.id as TournamentCriteria['format'] })
                      }
                      className={`px-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 justify-center transition-all border ${
                        criteria.format === item.id
                          ? 'bg-cyan-50 border-cyan-300 text-cyan-700 shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-slate-500 hover:bg-gray-100 hover:border-gray-300 hover:text-slate-800'
                      }`}
                    >
                      <Icon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Timeframe */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-bold text-cyan-700/70 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-600/50 shrink-0" />
                Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '24h', label: '24H' },
                  { id: '36h', label: '36H' },
                  { id: '48h', label: '48H' },
                  { id: '1week', label: '1W+' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      onChange({ ...criteria, timeframe: item.id as TournamentCriteria['timeframe'] })
                    }
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center transition-all border truncate ${
                      criteria.timeframe === item.id
                        ? 'bg-cyan-50 border-cyan-300 text-cyan-700 shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-slate-500 hover:bg-gray-100 hover:border-gray-300 hover:text-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Team Skills */}
            <div className={`space-y-3 ${compact ? '' : 'md:col-span-2 lg:col-span-1'}`}>
              <label className="text-[10px] uppercase tracking-widest font-bold text-cyan-700/70 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-cyan-600/50 shrink-0" />
                Team Skills
              </label>
              <input
                type="text"
                value={criteria.teamSkills || ''}
                onChange={(e) => onChange({ ...criteria, teamSkills: e.target.value })}
                placeholder="e.g. 2 Fullstack, 1 ML"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-200 transition-all hover:border-gray-300"
              />
            </div>

            {/* 5. Judging Focus */}
            <div className={`space-y-3 ${compact ? '' : 'md:col-span-2 lg:col-span-1'}`}>
              <label className="text-[10px] uppercase tracking-widest font-bold text-cyan-700/70 flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-cyan-600/50 shrink-0" />
                Primary Criteria
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'innovation', label: 'Innovation' },
                  { id: 'technical', label: 'Tech Depth' },
                  { id: 'business', label: 'Business' },
                  { id: 'ux', label: 'UI/UX Polish' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      onChange({ ...criteria, judgingFocus: item.id as TournamentCriteria['judgingFocus'] })
                    }
                    className={`px-3 py-2 rounded-xl text-[11px] font-semibold text-center transition-all border truncate ${
                      criteria.judgingFocus === item.id
                        ? 'bg-cyan-50 border-cyan-300 text-cyan-700 shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-slate-500 hover:bg-gray-100 hover:border-gray-300 hover:text-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Clear Button */}
          {activeCount > 0 && (
            <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => onChange({})}
                className="text-[10px] font-bold uppercase tracking-widest text-cyan-600/50 hover:text-cyan-700 transition-colors"
              >
                Reset All Settings
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

