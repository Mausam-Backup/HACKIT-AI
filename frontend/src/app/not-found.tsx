'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = 0.85;

    // fire immediately if already cached
    if (v.readyState >= 3) { setLoaded(true); return; }

    const onCanPlay = () => setLoaded(true);
    v.addEventListener('canplay', onCanPlay);
    return () => v.removeEventListener('canplay', onCanPlay);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#a8d4f0]">

      {/* ── LOADING PLACEHOLDER (visible until video ready) ── */}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            key="skeleton"
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-20 overflow-hidden"
          >
            {/* Base gradient — matches the video's sky-blue palette */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#c2e4f7] via-[#a8d4f0] to-[#7ab8e0]" />

            {/* Animated shimmer sweep — left to right */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
            />

            {/* Character silhouette blob — bottom center, pulses gently */}
            <motion.div
              animate={{ scale: [1, 1.03, 1], opacity: [0.18, 0.26, 0.18] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-96 rounded-t-full bg-[#5b9fd4]/30 blur-2xl"
            />

            {/* Floating particles */}
            {[
              { left: '20%', top: '30%', size: 8, delay: 0 },
              { left: '75%', top: '20%', size: 6, delay: 0.5 },
              { left: '60%', top: '65%', size: 10, delay: 1 },
              { left: '35%', top: '70%', size: 5, delay: 0.3 },
              { left: '85%', top: '55%', size: 7, delay: 0.8 },
            ].map((p, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -12, 0], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                className="absolute rounded-full bg-white/50"
                style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
              />
            ))}

            {/* Skeleton "404" ghost text */}
            <motion.p
              animate={{ opacity: [0.08, 0.14, 0.08] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center text-[22vw] font-black text-white/20 select-none leading-none tracking-tight pointer-events-none"
            >
              404
            </motion.p>

            {/* Loading bar — thin line at very bottom */}
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/10">
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full-screen video animation ── */}
      <video
        ref={videoRef}
        src="/assets/404.mp4"
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* ── Overlays — makes it feel like art, not a video ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55)_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.5) 2px,rgba(255,255,255,0.5) 3px)',
          backgroundSize: '100% 3px',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />

      {/* ── Buttons — fade in once video is ready ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 16 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 flex items-end justify-center pb-16 z-30"
      >
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white text-slate-900 font-bold text-sm hover:bg-white/90 transition-all shadow-[0_8px_32px_rgba(255,255,255,0.2)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.3)] hover:-translate-y-0.5">
              <Home className="w-4 h-4" />
              Back Home
            </button>
          </Link>

          <Link href="/interviews">
            <button className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/10 border border-white/25 backdrop-blur-md text-white font-semibold text-sm hover:bg-white/20 transition-all hover:-translate-y-0.5">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Interviews
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
