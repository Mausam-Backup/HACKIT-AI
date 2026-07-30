"use client";

import React, { useState, useEffect } from 'react';
import { ProblemAnalysis } from '@/services/coach-service';
import { 
  Trophy, Sparkles, CheckCircle2, AlertTriangle, Layers, Clock,
  Lightbulb, Copy, Check, Zap, ArrowRight, Flame, Download,
  Brain, BarChart3, CheckSquare, Terminal, Presentation, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ProblemCardProps { analysis: ProblemAnalysis; }

const ratingColor = (r: string) =>
  r === 'High' ? 'text-cyan-700 bg-cyan-50 border-cyan-200' :
  r === 'Medium' ? 'text-blue-700 bg-blue-50 border-blue-200' :
  'text-sky-700 bg-sky-50 border-sky-200';

export default function ProblemCard({ analysis }: ProblemCardProps) {
  const [activeTab, setActiveTab] = useState<'overview'|'tech'|'roadmap'|'sprint'|'pitch'>('overview');
  const [copied, setCopied] = useState(false);
  const [cmdCopied, setCmdCopied] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string,boolean>>({});
  const storageKey = `hackathon_tasks_${analysis.title.replace(/\s+/g,'_').toLowerCase()}`;

  useEffect(() => {
    try { const s = localStorage.getItem(storageKey); if (s) setCompletedTasks(JSON.parse(s)); } catch {}
  }, [storageKey]);

  const toggleTask = (k: string) => {
    setCompletedTasks(prev => {
      const u = { ...prev, [k]: !prev[k] };
      try { localStorage.setItem(storageKey, JSON.stringify(u)); } catch {}
      return u;
    });
  };

  const getExportMarkdown = () => `# 🏆 HACKATHON WINNING PLAN: ${analysis.title}
**Win Potential:** ${analysis.winScore}/100 | **Impact:** ${analysis.impactRating} | **Feasibility:** ${analysis.technicalFeasibility}

## 💡 Coach Verdict
> ${analysis.verdict}

## 🛠️ TECH STACK
${analysis.techStack.map(t=>`- **${t.category}:** ${t.name} (*${t.reason}*)`).join('\n')}

## 🚀 MVP FEATURES
### Must-Have:
${analysis.featureRoadmap.mustHaveMVP.map(f=>`- ${f}`).join('\n')}
### Differentiators:
${analysis.featureRoadmap.differentiators.map(f=>`- ${f}`).join('\n')}
### Skip:
${analysis.featureRoadmap.skipOrTraps.map(f=>`- ❌ ${f}`).join('\n')}

## ⏱️ TIMELINE
${analysis.timeline.map(t=>`### ${t.phase} (${t.duration})\n${t.tasks.map(x=>`- [ ] ${x}`).join('\n')}`).join('\n\n')}

## 🎯 PITCH TIPS
${analysis.pitchTips.map(p=>`- ${p}`).join('\n')}`.trim();

  const get5SlideDeckOutline = () => `# 📊 5-SLIDE PITCH DECK: ${analysis.title}
---
## SLIDE 1: PROBLEM
- Real-world gap in target market
---
## SLIDE 2: SOLUTION & LIVE DEMO
- **Product:** ${analysis.title}
- **Value Prop:** ${analysis.verdict}
---
## SLIDE 3: TECH ARCHITECTURE
${analysis.techStack.map(t=>`- **${t.category}:** ${t.name}`).join('\n')}
---
## SLIDE 4: MVP ROADMAP
- **Must-Have:** ${analysis.featureRoadmap.mustHaveMVP.join(', ')}
- **WOW Factor:** ${analysis.featureRoadmap.differentiators.join(', ')}
---
## SLIDE 5: JUDGE QA & MARKET
${analysis.pitchTips.map(p=>`- ${p}`).join('\n')}`.trim();

  const handleCopyPlan = () => { navigator.clipboard.writeText(getExportMarkdown()); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const handleCopyCommand = (cmd: string) => { navigator.clipboard.writeText(cmd); setCmdCopied(true); setTimeout(()=>setCmdCopied(false),2000); };
  const handleDownloadFile = (format: 'md'|'json'|'slides') => {
    const filename = `${analysis.title.replace(/[^a-z0-9]/gi,'_').toLowerCase()}_${format==='slides'?'pitch_deck':'plan'}.${format==='json'?'json':'md'}`;
    const content = format==='json'?JSON.stringify(analysis,null,2):format==='slides'?get5SlideDeckOutline():getExportMarkdown();
    const blob = new Blob([content],{type:format==='json'?'application/json':'text/markdown'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href=url; a.download=filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const totalTasks = analysis.timeline.reduce((a,p)=>a+p.tasks.length,0);
  const doneCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPct = totalTasks>0?Math.round((doneCount/totalTasks)*100):0;

  const radarData = [
    { metric: 'Win Score', score: analysis.winScore },
    { metric: 'Demo WOW', score: Math.min(100, analysis.winScore+5) },
    { metric: 'Feasibility', score: analysis.technicalFeasibility==='High'?90:analysis.technicalFeasibility==='Medium'?70:50 },
    { metric: 'Impact', score: analysis.impactRating==='High'?95:analysis.impactRating==='Medium'?75:55 },
    { metric: 'Novelty', score: (analysis.noveltyScore||8)*10 },
  ];

  const terminalCmd = `npx create-hackathon-app@latest --name=${analysis.title.replace(/[^a-z0-9]/gi,'-').toLowerCase()} --stack=next15-supabase-groq`;

  const tabs = [
    { id:'overview', label:'Overview & Metrics', icon:BarChart3 },
    { id:'tech', label:'Tech Stack', icon:Layers },
    { id:'roadmap', label:'MVP Roadmap', icon:Lightbulb },
    { id:'sprint', label:`Sprint Tracker (${progressPct}%)`, icon:CheckSquare },
    { id:'pitch', label:'Pitch Strategy', icon:Zap },
  ];

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden text-slate-800 shadow-sm not-italic" style={{fontFamily:'inherit',fontStyle:'normal'}}>

      {/* ── Header ── */}
      <div className="p-6 border-b border-gray-100 space-y-4">
        {/* Top row: badges - spaced out properly */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="inline-flex items-center">
            <span className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center gap-1.5 uppercase tracking-widest shadow-sm">
              <Trophy className="w-3.5 h-3.5" /> Recommended Strategy
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${ratingColor(analysis.impactRating)}`}>
              Impact: {analysis.impactRating}
            </span>
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${ratingColor(analysis.technicalFeasibility)}`}>
              Feasibility: {analysis.technicalFeasibility}
            </span>
          </div>
        </div>

        {/* Title — full width */}
        <h3 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight not-italic">
          {analysis.title}
        </h3>

        {/* Bottom row: win score + actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3 shadow-sm">
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-0.5">Win Rating</div>
              <div className="text-2xl font-black text-slate-900 leading-none">
                {analysis.winScore}<span className="text-sm font-bold text-slate-400">/100</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyan-100 border border-cyan-200 flex items-center justify-center">
              <Flame className="w-5 h-5 text-cyan-600 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleCopyPlan} className="px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-slate-600 hover:text-slate-900 border border-gray-200 transition-all flex items-center gap-2 text-xs font-bold">
              {copied ? <Check className="w-4 h-4 text-cyan-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={() => handleDownloadFile('md')} className="px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-slate-600 hover:text-slate-900 border border-gray-200 transition-all flex items-center gap-2 text-xs font-bold">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex items-center gap-1 overflow-x-auto bg-gray-50 border-b border-gray-100 px-3 py-2 scrollbar-none">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id as any;
          return (
            <button key={tab.id} onClick={()=>setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                active ? 'bg-white text-slate-900 shadow-sm border border-gray-200' : 'text-slate-500 hover:text-slate-900 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="p-6">

        {/* TAB 1 — OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Verdict */}
              <div className="lg:col-span-7 h-full bg-white border border-gray-100 rounded-xl p-6 md:p-8 flex flex-col justify-center shadow-sm relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-100/50 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-5 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-cyan-700/80">Grandmaster Coach Verdict</h4>
                </div>
                <p className="text-lg md:text-xl text-slate-800 leading-relaxed font-semibold relative z-10">{analysis.verdict}</p>
              </div>
              {/* Radar */}
              <div className="lg:col-span-5 bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col items-center min-h-[220px]">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 self-start mb-2">Strategy Radar</span>
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="65%">
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <PolarRadiusAxis angle={30} domain={[0,100]} stroke="#cbd5e1" tick={false} />
                      <Radar name="Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Pros & Cons table-style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden border border-cyan-200 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 bg-cyan-50 border-b border-cyan-200">
                  <CheckCircle2 className="w-4 h-4 text-cyan-700" />
                  <span className="text-xs font-black uppercase tracking-widest text-cyan-700">Winning Advantages</span>
                </div>
                <div className="divide-y divide-gray-100 bg-white">
                  {analysis.pros.map((pro,i) => (
                    <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600/80 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 leading-relaxed">{pro}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-cyan-200 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 bg-cyan-50 border-b border-cyan-200">
                  <AlertTriangle className="w-4 h-4 text-cyan-700" />
                  <span className="text-xs font-black uppercase tracking-widest text-cyan-700">Pitfalls to Guard</span>
                </div>
                <div className="divide-y divide-gray-100 bg-white">
                  {analysis.cons.map((con,i) => (
                    <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                      <AlertTriangle className="w-3.5 h-3.5 text-cyan-600/80 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 leading-relaxed">{con}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 — TECH STACK */}
        {activeTab === 'tech' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <div className="grid grid-cols-12 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-gray-50 border-b border-gray-200 px-5 py-3">
                <span className="col-span-3">Category</span>
                <span className="col-span-3">Technology</span>
                <span className="col-span-6">Reason</span>
              </div>
              <div className="divide-y divide-gray-100 bg-white">
                {analysis.techStack.map((tech,i) => (
                  <div key={i} className="grid grid-cols-12 items-center px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="col-span-3">
                      <span className="px-2.5 py-1 rounded-md bg-gray-100 text-[10px] font-bold text-slate-600 border border-gray-200">
                        {tech.category}
                      </span>
                    </div>
                    <div className="col-span-3 text-[15px] font-bold text-slate-800">{tech.name}</div>
                    <div className="col-span-6 text-sm text-slate-600 leading-relaxed">{tech.reason}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal command */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-pink-400" /> 1-Click Setup Command
                </span>
                <button onClick={()=>handleCopyCommand(terminalCmd)} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-bold transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100">
                  {cmdCopied?<Check className="w-3.5 h-3.5 text-pink-500"/>:<Copy className="w-3.5 h-3.5"/>}
                  {cmdCopied?'Copied!':'Copy'}
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 font-mono text-[13px] text-slate-800 overflow-x-auto shadow-inner">
                {terminalCmd}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3 — MVP ROADMAP */}
        {activeTab === 'roadmap' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Must-Have */}
            <div className="rounded-xl overflow-hidden border border-pink-200 shadow-sm">
              <div className="flex items-center gap-2 px-5 py-3 bg-pink-50 border-b border-pink-200">
                <CheckCircle2 className="w-4 h-4 text-pink-700" />
                <span className="text-xs font-black uppercase tracking-widest text-pink-700">Must-Have MVP Features</span>
              </div>
              <div className="divide-y divide-gray-100 bg-white">
                {analysis.featureRoadmap.mustHaveMVP.map((item,i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-pink-50/50 transition-colors">
                    <span className="text-xs font-black text-pink-600/60 mt-0.5 shrink-0 font-mono">{String(i+1).padStart(2,'0')}</span>
                    <span className="text-sm text-slate-700 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Differentiators */}
            <div className="rounded-xl overflow-hidden border border-purple-200 shadow-sm">
              <div className="flex items-center gap-2 px-5 py-3 bg-purple-50 border-b border-purple-200">
                <Sparkles className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-black uppercase tracking-widest text-purple-700">Differentiators — WOW Factor</span>
              </div>
              <div className="divide-y divide-gray-100 bg-white">
                {analysis.featureRoadmap.differentiators.map((item,i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-purple-50/50 transition-colors">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600/80 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Traps */}
            <div className="rounded-xl overflow-hidden border border-cyan-200 shadow-sm">
              <div className="flex items-center gap-2 px-5 py-3 bg-cyan-50 border-b border-cyan-200">
                <XCircle className="w-4 h-4 text-cyan-700" />
                <span className="text-xs font-black uppercase tracking-widest text-cyan-700">Traps to Skip</span>
              </div>
              <div className="divide-y divide-gray-100 bg-white">
                {analysis.featureRoadmap.skipOrTraps.map((item,i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-cyan-50/50 transition-colors">
                    <XCircle className="w-3.5 h-3.5 text-cyan-600/80 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-400 line-through leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4 — SPRINT TRACKER */}
        {activeTab === 'sprint' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Progress bar */}
            <div className="space-y-2.5 bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-800 flex items-center gap-2"><Clock className="w-4 h-4 text-pink-500"/>Sprint Progress</span>
                <span className="font-mono font-bold text-slate-800">{doneCount}/{totalTasks} tasks · {progressPct}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-pink-500 rounded-full transition-all duration-500" style={{width:`${progressPct}%`}}/>
              </div>
            </div>

            {/* Timeline table */}
            <div className="space-y-4">
              {analysis.timeline.map((phase,pIdx) => (
                <div key={pIdx} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
                    <span className="text-sm font-black text-slate-800 uppercase tracking-wider">{phase.phase}</span>
                    <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-gray-200">{phase.duration}</span>
                  </div>
                  <div className="divide-y divide-gray-100 bg-white">
                    {phase.tasks.map((task,tIdx) => {
                      const key = `${pIdx}-${tIdx}`;
                      const done = !!completedTasks[key];
                      return (
                        <label key={tIdx} onClick={()=>toggleTask(key)}
                          className="flex items-center gap-3.5 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors group"
                        >
                          <div className={`w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0 border transition-all ${done?'bg-pink-500 border-pink-500':'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                            {done && <Check className="w-3 h-3 text-white"/>}
                          </div>
                          <span className={`text-sm transition-colors leading-relaxed ${done?'line-through text-slate-400':'text-slate-700 group-hover:text-slate-900'}`}>{task}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5 — PITCH STRATEGY */}
        {activeTab === 'pitch' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200 gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-pink-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700">Winning Pitch Tips & Judge Strategy</span>
                </div>
                <button onClick={()=>handleDownloadFile('slides')} className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 text-xs font-bold transition-all flex items-center gap-2 shadow-sm">
                  <Presentation className="w-3.5 h-3.5 text-pink-500"/>Export 5-Slide Deck (.md)
                </button>
              </div>
              <div className="divide-y divide-gray-100 bg-white">
                {analysis.pitchTips.map((tip,i) => (
                  <div key={i} className="flex items-start gap-3.5 px-5 py-4 hover:bg-gray-50 transition-colors">
                    <span className="text-xs font-black text-pink-600 mt-0.5 shrink-0 font-mono bg-pink-50 px-1.5 py-0.5 rounded">{String(i+1).padStart(2,'0')}</span>
                    <span className="text-sm text-slate-800 leading-relaxed font-medium">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice CTA */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-pink-200 flex items-center justify-center shrink-0 shadow-inner">
                  <Brain className="w-6 h-6 text-pink-500 animate-pulse" />
                </div>
                <div>
                  <h5 className="text-[15px] font-black text-slate-900 not-italic mb-1">Simulate Judge Q&A & Pitch Practice</h5>
                  <p className="text-sm text-slate-600 font-medium">Practice your 3-minute pitch live with AscendPrep AI Judges</p>
                </div>
              </div>
              <Link href={`/interviews?topic=${encodeURIComponent(analysis.title)}`}
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 !text-white font-extrabold text-sm flex items-center gap-2 whitespace-nowrap transition-all shadow-lg hover:shadow-slate-500/20">
                Practice Pitch Live <ArrowRight className="w-4 h-4 text-white"/>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
