"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Square } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CallToAction() {
  const containerRef = useRef<HTMLElement>(null);
  const topMarqueeRef = useRef<HTMLDivElement>(null);
  const bottomMarqueeRef = useRef<HTMLDivElement>(null);
  
  const topMarqueeItems = [
    "Innovation",
    "Precision",
    "Trust",
    "Collaboration",
    "Excellence",
  ];

  const bottomMarqueeItems = [
    "Build the Future",
    "Join Hackathons",
    "Pitch Your Idea",
    "Level Up Skills",
    "Grow Your Network",
  ];

  useGSAP(() => {
    if (!containerRef.current) return;
    
    gsap.to(containerRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "center center",
        end: "+=800 center",
        scrub: 0.5,
        pin: true,
        pinSpacing: true,
        markers: false,
      },
    });

    gsap.to(topMarqueeRef.current, {
      xPercent: -15,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "center center",
        end: "+=800 center",
        scrub: 0.5,
      },
    });

    gsap.fromTo(
      bottomMarqueeRef.current,
      { xPercent: -15 },
      {
        xPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "center center",
          end: "+=800 center",
          scrub: 0.5,
        },
      }
    );
  }, []);

  return (
    <div className="bg-[#EAEAEA]">
      <section
        ref={containerRef}
        className="relative w-full min-h-screen flex flex-col items-center justify-between font-sans overflow-hidden"
      >
        {/* Top Marquee */}
        <div className="w-full bg-black py-5 flex overflow-hidden">
          <div
            ref={topMarqueeRef}
            className="flex whitespace-nowrap items-center shrink-0 w-max"
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex">
                {topMarqueeItems.map((item, idx) => (
                  <div key={idx} className="flex items-center px-16">
                    <span className="text-white text-2xl md:text-3xl font-light tracking-[0.2em] uppercase">
                      {item}
                    </span>
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="white"
                      className="ml-32"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                    </svg>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Main Quote Area */}
        <div className="w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center my-auto">
          <p className="text-5xl md:text-7xl lg:text-[6.5rem] leading-[1.5] lg:leading-[1.4] font-normal text-black">
            &ldquo; Let&apos;s build a <br />
            memorable & <span className="italic">inspiring</span> <br />
            web application <span className="text-[#C6A052]">together</span> &rdquo;
          </p>
        </div>

        {/* Bottom Marquee */}
        <div className="w-full border-y border-black/30 py-5 flex overflow-hidden cursor-pointer hover:bg-black/5 transition-colors">
          <div
            ref={bottomMarqueeRef}
            className="flex whitespace-nowrap items-center shrink-0 w-max"
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex">
                {bottomMarqueeItems.map((item, idx) => (
                    <div key={idx} className="flex items-center px-16">
                      <span className="text-black text-2xl md:text-3xl font-medium tracking-[0.1em] uppercase">
                        {item}
                      </span>
                      <Square className="ml-32 size-8 text-[#C6A052] stroke-[2]" />
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
