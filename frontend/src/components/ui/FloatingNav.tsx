"use client";

import React, { useState } from 'react';

export default function FloatingNav() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[95vw] max-w-fit">
      <div 
        className="flex items-center justify-between rounded-full border border-black/5 shadow-2xl transition-all duration-500 ease-out overflow-x-auto no-scrollbar text-black w-full bg-white"
        style={{
          padding: isHovered ? '12px 24px' : '12px 16px',
          gap: isHovered ? '24px' : '16px',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left Side: Icons + Text */}
        <div className="flex items-center gap-4 shrink-0 sm:gap-6">
          <a href="/" className="group flex items-center gap-1.5 text-black/60 hover:text-black transition-colors">
            <i className="ph ph-house text-lg"></i>
            <span className="text-sm font-medium tracking-wide whitespace-nowrap">Home</span>
          </a>
          <a href="/interviews" className="group flex items-center gap-1.5 text-black/60 hover:text-black transition-colors">
            <i className="ph ph-brain text-lg"></i>
            <span className="text-sm font-semibold tracking-wide whitespace-nowrap">AI Interviews</span>
          </a>
          <a href="/coach" className="group flex items-center gap-1.5 text-black/60 hover:text-black transition-colors">
            <i className="ph ph-chalkboard-teacher text-lg"></i>
            <span className="text-sm font-semibold tracking-wide whitespace-nowrap">AI Coach</span>
          </a>
          <a href="/dashboard" className="group flex items-center gap-1.5 text-black/60 hover:text-black transition-colors">
            <i className="ph ph-presentation-chart text-lg"></i>
            <span className="text-sm font-semibold tracking-wide whitespace-nowrap">Presentations</span>
          </a>
          <a href="/docs" className="group flex items-center gap-1.5 text-black/60 hover:text-black transition-colors">
            <i className="ph ph-package text-lg"></i>
            <span className="text-sm font-semibold tracking-wide whitespace-nowrap">Package Docs</span>
          </a>
          <a href="/upcoming-hackathons" className="group flex items-center gap-1.5 text-black/60 hover:text-black transition-colors">
            <i className="ph ph-trophy text-lg"></i>
            <span className="text-sm font-semibold tracking-wide whitespace-nowrap">Hackathons</span>
          </a>
          <a href="/resources" className="group flex items-center gap-1.5 text-black/60 hover:text-black transition-colors">
            <i className="ph ph-books text-lg"></i>
            <span className="text-sm font-semibold tracking-wide whitespace-nowrap">Resources</span>
          </a>
        </div>
        
        {/* Right Side: Name */}
        <div className="flex items-center shrink-0 ml-4">
          <div className="bg-black text-white px-4 py-1.5 sm:px-5 sm:py-2 rounded-full font-bold text-xs tracking-wide shadow-md transition-transform duration-300 hover:scale-105 cursor-pointer whitespace-nowrap">
            HAC-KIT AI
          </div>
        </div>
      </div>
    </div>
  );
}
