'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface SkillData {
  skill: string;
  score: number;
}

interface SkillRadarChartProps {
  data: SkillData[];
  title?: string;
  description?: string;
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
  data,
  title = 'EVALUATION BREAKDOWN',
  description = 'MULTI-DIMENSIONAL SCORES',
}) => {
  return (
    <div className="w-full h-full flex flex-col">
      {title && (
        <div className="mb-4">
          <h4 className="text-xs font-bold text-black uppercase tracking-widest">{title}</h4>
          {description && <p className="text-[10px] text-black/50 uppercase tracking-wider mt-1">{description}</p>}
        </div>
      )}

      <div className="flex-1 min-h-[250px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#000000" strokeOpacity={0.1} />
            <PolarAngleAxis dataKey="skill" stroke="#000000" strokeOpacity={0.2} tick={{ fill: '#000000', fontSize: 10, fontWeight: 700, fontFamily: 'inherit' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#000000" strokeOpacity={0.2} tick={{ fill: '#000000', fontSize: 10, fillOpacity: 0.5 }} />
            <Radar
              name="Candidate"
              dataKey="score"
              stroke="#000000"
              strokeWidth={2}
              fill="#000000"
              fillOpacity={0.05}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
