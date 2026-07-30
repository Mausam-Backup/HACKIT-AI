'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Lightbulb, Target } from 'lucide-react';
import { SkillRadarChart } from './skill-radar-chart';
import { InterviewAnalysis } from '@/services/groq-analysis';

interface InterviewSkillCardProps {
  analysis: InterviewAnalysis;
  title?: string;
}

export function InterviewSkillCard({ analysis, title = 'EVALUATION BREAKDOWN' }: InterviewSkillCardProps) {
  const { skill_breakdown, detected_issues } = analysis;

  const radarData = [
    { skill: 'Communication', score: Math.round((skill_breakdown?.communication?.score || analysis.communication_score) * 100) },
    { skill: 'Technical', score: Math.round((skill_breakdown?.technical?.score || analysis.technical_score) * 100) },
    { skill: 'Problem Solving', score: Math.round((skill_breakdown?.problem_solving?.score || analysis.problem_solving_score) * 100) },
    { skill: 'Code Quality', score: Math.round((skill_breakdown?.code_quality?.score || analysis.code_quality_score) * 100) },
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-500/10 text-red-600 border border-red-500/20 uppercase tracking-widest text-[10px] rounded-full">High</Badge>;
      case 'medium':
        return <Badge className="bg-orange-500/10 text-orange-600 border border-orange-500/20 uppercase tracking-widest text-[10px] rounded-full">Medium</Badge>;
      default:
        return <Badge className="bg-black/5 text-black border border-black/10 uppercase tracking-widest text-[10px] rounded-full">Minor</Badge>;
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Radar Chart */}
      <div className="bg-white border border-black/10 rounded-3xl p-6 flex-1">
        <SkillRadarChart data={radarData} title={title} description="MULTI-DIMENSIONAL SCORES" />
      </div>

      {/* Issues Detected */}
      {detected_issues && detected_issues.length > 0 && (
        <Card className="border-black/10 bg-white rounded-3xl shadow-none">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black/5 border border-black/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-black/60" />
              </div>
              <div>
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-black">Behavioral Flags</CardTitle>
                <CardDescription className="text-[10px] uppercase tracking-wider text-black/50 mt-1">
                  Automated speech & posture detection
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            {detected_issues.map((issue, idx) => (
              <div key={idx} className="p-4 bg-black/5 border border-black/10 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] uppercase tracking-widest text-black">
                    {issue.issue_type.replace('_', ' ')} {issue.count > 0 && `(${issue.count}x)`}
                  </span>
                  {getSeverityBadge(issue.severity)}
                </div>
                <p className="text-[11px] uppercase tracking-wide leading-relaxed text-black/70 font-medium">{issue.description}</p>
                {issue.context && (
                  <p className="text-[10px] font-mono text-black/50 italic bg-white p-2.5 rounded-lg border border-black/10 mt-2">
                    "{issue.context}"
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
