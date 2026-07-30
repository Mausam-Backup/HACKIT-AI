'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './horizontal-scroll.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface HorizontalScrollProps {
  children: React.ReactNode;
}

export default function HorizontalScroll({ children }: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !wrapperRef.current) return;

    // Use total scroll width of the inner container minus viewport width
    const scrollWidth = containerRef.current.scrollWidth - window.innerWidth;

    const scrollTween = gsap.to(containerRef.current, {
      x: -scrollWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: wrapperRef.current,
        pin: true,
        scrub: 1,
        // The end value defines how long the scroll lasts. 
        // We set it to the scroll width so scrolling feels natural (1px vertical = 1px horizontal)
        end: () => `+=${scrollWidth}`,
        invalidateOnRefresh: true,
      },
    });

  }, { scope: wrapperRef });

  return (
    <div className="mwg_effect073" ref={wrapperRef}>
      <div className="pin-height">
        <div className="hs-container" ref={containerRef}>
          {children}
        </div>
      </div>
    </div>
  );
}
