"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getApiUrl } from "@/utils/api";

type AuthStatus = {
  configured: boolean;
  authenticated: boolean;
  username: string | null;
};

export default function FloatingNav() {
  const [isHovered, setIsHovered] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(getApiUrl("/api/v1/auth/status"), { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setAuthStatus(data);
        }
      } catch (e) {
        console.error("Auth check failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector('.video-stories');
      if (section) {
        // GSAP might wrap the pinned section in a pin-spacer
        const pinSpacer = section.closest('.pin-spacer') || section;
        const rect = pinSpacer.getBoundingClientRect();
        
        // Hide the navbar if the video-stories section is currently overlapping the top area
        if (rect.top <= 150 && rect.bottom >= 150) {
          setIsHidden(true);
        } else {
          setIsHidden(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`fixed left-1/2 -translate-x-1/2 z-[100] w-[95vw] max-w-fit transition-all duration-500 ease-in-out ${isHidden || isLoading ? '-top-32 opacity-0 pointer-events-none' : 'top-8 opacity-100'}`}>
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
          
          {authStatus?.authenticated && (
            <>
              <a href="/interviews" className="group flex items-center gap-1.5 text-black/60 hover:text-black transition-colors">
                <i className="ph ph-brain text-lg"></i>
                <span className="text-sm font-semibold tracking-wide whitespace-nowrap">AI Interviews</span>
              </a>
              <a href="/coach" className="group flex items-center gap-1.5 text-black/60 hover:text-black transition-colors">
                <i className="ph ph-chalkboard-teacher text-lg"></i>
                <span className="text-sm font-semibold tracking-wide whitespace-nowrap">AI Coach</span>
              </a>
              <a href="/workflow" className="group flex items-center gap-1.5 text-black/60 hover:text-black transition-colors">
                <i className="ph ph-git-fork text-lg"></i>
                <span className="text-sm font-semibold tracking-wide whitespace-nowrap">AI Workflow</span>
              </a>
              <a href="/dashboard" className="group flex items-center gap-1.5 text-black/60 hover:text-black transition-colors">
                <i className="ph ph-presentation-chart text-lg"></i>
                <span className="text-sm font-semibold tracking-wide whitespace-nowrap">Presentations</span>
              </a>
              <a href="/docs" className="group flex items-center gap-1.5 text-black/60 hover:text-black transition-colors">
                <i className="ph ph-package text-lg"></i>
                <span className="text-sm font-semibold tracking-wide whitespace-nowrap">App Builder</span>
              </a>
            </>
          )}
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
          {authStatus?.authenticated ? (
            <Link href="/account" className="bg-black text-white px-4 py-1.5 sm:px-4 sm:py-1.5 rounded-full font-bold text-xs tracking-wide shadow-md transition-transform duration-300 hover:scale-105 cursor-pointer flex items-center gap-2 whitespace-nowrap">
              <div className="size-5 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                <i className="ph ph-user text-white text-xs"></i>
              </div>
              <span className="text-white hover:text-white">
                {authStatus.username ? authStatus.username.substring(0, 5) + '...' : 'User...'}
              </span>
            </Link>
          ) : (
            <Link href="/login" className="bg-black text-white px-4 py-1.5 sm:px-4 sm:py-1.5 rounded-full font-bold text-xs tracking-wide shadow-md transition-transform duration-300 hover:scale-105 cursor-pointer flex items-center gap-2 whitespace-nowrap">
              <div className="size-5 rounded-md bg-white flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-0.5" />
              </div>
              <span className="text-white hover:text-white">HAC-KIT AI</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
