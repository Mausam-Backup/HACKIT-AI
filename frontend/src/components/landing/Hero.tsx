"use client";

import React, { useState, useEffect } from "react";
import "./hero-styles.css";
import Aurora from "@/components/ui/Aurora";
import GlobeWireframe from '@/components/ui/globe-wireframe';

const locations: [number, number][] = [
  [37.7749, -122.4194], // SF
  [40.7128, -74.0060], // NY
  [51.5074, -0.1278], // London
  [25.2048, 55.2708], // Dubai
  [1.3521, 103.8198], // Singapore
  [-33.8688, 151.2093], // Sydney
  [35.6762, 139.6503], // Tokyo
  [48.8566, 2.3522], // Paris
  [55.7558, 37.6176], // Moscow
  [19.0760, 72.8777], // Mumbai
  [34.0522, -118.2437], // LA
  [41.8781, -87.6298], // Chicago
  [-23.5505, -46.6333], // Sao Paulo
  [-34.6037, -58.3816], // Buenos Aires
  [6.5244, 3.3792], // Lagos
  [-1.2921, 36.8219], // Nairobi
  [39.9042, 116.4074], // Beijing
  [22.3193, 114.1694], // Hong Kong
  [28.6139, 77.2090], // New Delhi
];

const connections = [
  { start: locations[1], end: locations[2] }, // NY -> London
  { start: locations[0], end: locations[6] }, // SF -> Tokyo
  { start: locations[11], end: locations[7] }, // Chicago -> Paris
  { start: locations[2], end: locations[3] }, // London -> Dubai
  { start: locations[7], end: locations[8] }, // Paris -> Moscow
  { start: locations[2], end: locations[14] }, // London -> Lagos
  { start: locations[3], end: locations[9] }, // Dubai -> Mumbai
  { start: locations[3], end: locations[4] }, // Dubai -> Singapore
  { start: locations[9], end: locations[4] }, // Mumbai -> Singapore
  { start: locations[4], end: locations[6] }, // Singapore -> Tokyo
  { start: locations[6], end: locations[16] }, // Tokyo -> Beijing
  { start: locations[16], end: locations[17] }, // Beijing -> HK
  { start: locations[17], end: locations[4] }, // HK -> Singapore
  { start: locations[18], end: locations[4] }, // Delhi -> Singapore
  { start: locations[4], end: locations[5] }, // Singapore -> Sydney
  { start: locations[5], end: locations[10] }, // Sydney -> LA
  { start: locations[1], end: locations[12] }, // NY -> Sao Paulo
  { start: locations[10], end: locations[12] }, // LA -> Sao Paulo
  { start: locations[12], end: locations[13] }, // Sao Paulo -> BA
  { start: locations[14], end: locations[15] }, // Lagos -> Nairobi
  { start: locations[3], end: locations[15] }, // Dubai -> Nairobi
];

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // We removed the blocky skeleton return statement.
  // The UI will now render immediately, and only the heavy Globe component 
  // will use a sleek, minimalist wireframe skeleton until mounted.

  return (
    <section className="home-hero">
      <Aurora
        colorStops={["#3b82f6", "#8b5cf6", "#ec4899"]}
        blend={0.5}
        amplitude={0.15}
        speed={0.4}
      />

      <h1 className="hero-title">
        Build and <img src="/assets/rocket.png" alt="rocket" className="title-emoji" />
        Launch Your <br /> Hackathon Project in Just <span className="accent">48 Hours</span>
      </h1>

      <div 
        className="relative flex justify-center w-full overflow-hidden" 
        style={{ 
          height: '225px', 
          marginTop: '40px', 
          marginBottom: '20px',
          maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
        }}
      >
        
        {/* Subtle Glowing Backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Globe */}
        <div className="absolute top-0 flex justify-center w-full">
          {mounted ? (
            <div className="animate-in fade-in duration-1000 ease-in-out">
              <GlobeWireframe 
                className='w-[450px] h-[450px] z-50 relative' 
                variant='solid' 
                locations={locations}
                connections={connections}
              />
            </div>
          ) : (
            <div className="w-[450px] h-[450px] rounded-full border-[1px] border-blue-500/10 shadow-[0_0_80px_rgba(59,130,246,0.05)] animate-pulse z-50 relative" />
          )}
        </div>
      </div>      {/* CURVED LINES (SVG) */}
      <div className="hero-lines">
        <div className="line-group left-outer">
          <img src="/assets/Vector 2681.png" alt="Left Outer Line" className="line" />
          <img src="/assets/gear.png" alt="gear" className="icon-card" />
        </div>

        <div className="line-group left-inner">
          <img src="/assets/Vector 2682.png" alt="Left Inner Line" className="line" />
          <img src="/assets/rocket-small.png" alt="rocket" className="icon-card" />
        </div>

        <div className="line-group right-inner">
          <img src="/assets/Vector 2683.png" alt="Right Inner Line" className="line" />
          <img src="/assets/light.png" alt="light" className="icon-card" />
        </div>

        <div className="line-group right-outer">
          <img src="/assets/Vector 2684.png" alt="Right Outer Line" className="line" />
          <img src="/assets/monitor.png" alt="monitor" className="icon-card" />
        </div>
      </div>
      {/* brands row */}
      <div className="brands-row">
        <span>Trusted by Founders from</span>
      </div>

      <div className="brand-carousel">
        <div className="brand-track">
          <img src="/assets/Qualcomm-Logo 1.png" alt="Qualcomm" />
          <img src="/assets/Walmart_logo_(2008) 1.png" alt="Walmart" />
          <img src="/assets/Amazon_logo 1.png" alt="Amazon" />
          <img src="/assets/Adobe_Corporate_logo 1.png" alt="Adobe" />
          <img src="/assets/Deloitte_old_blue_logo 1.png" alt="Deloitte" />

          {/* Duplicate for seamless scroll */}
          <img src="/assets/Qualcomm-Logo 1.png" alt="Qualcomm" />
          <img src="/assets/Walmart_logo_(2008) 1.png" alt="Walmart" />
          <img src="/assets/Amazon_logo 1.png" alt="Amazon" />
          <img src="/assets/Adobe_Corporate_logo 1.png" alt="Adobe" />
          <img src="/assets/Deloitte_old_blue_logo 1.png" alt="Deloitte" />
        </div>

        <div className="fade fade-left"></div>
        <div className="fade fade-right"></div>
      </div>
    </section>
  );
}
