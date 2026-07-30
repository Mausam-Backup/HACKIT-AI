"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function VideoStories() {
  const containerRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const rail = railRef.current;
    const container = containerRef.current;
    if (!rail || !container) return;

    // Calculate how far to scroll the rail left
    const scrollAmount = rail.scrollWidth - window.innerWidth;
    if (scrollAmount <= 0) return;

    const proxy = { scrollLeft: 0 };

    gsap.to(proxy, {
      scrollLeft: scrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: "center center",
        end: () => `+=${scrollAmount}`,
        pin: true,
        scrub: 1, // Smooth scrubbing
        invalidateOnRefresh: true,
      },
      onUpdate: () => {
        rail.scrollLeft = proxy.scrollLeft;
      }
    });
  }, []);

  return (
    <section ref={containerRef} className="video-stories" id="our-team" aria-labelledby="video-stories-title">
      <div className="video-stories__header">
        <h2 id="video-stories-title">The Ultimate Multi-Agent Hackathon Winning Kit</h2>
        <p>
          Everything you need to ideate, build, and pitch your hackathon project. Leverage specialized AI agents for coaching, coding, and presentations to secure your spot on the podium.
        </p>
      </div>

      <div className="video-stories__rail" ref={railRef} aria-label="HAC-KIT AI success stories">
        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="/resources and hacakthons.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>Hackathons & Resource Hub</p>
            <h3>Discover global hackathons and access curated developer toolkits, starter templates, and API documentation in one centralized portal.</h3>
            <span>Discovery · Curated Toolkits</span>
          </div>
        </article>

        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="/ai-interview-demo.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>AI Pitch Interview Simulator</p>
            <h3>Practice your hackathon pitch with interactive AI interviewers. Receive real-time audio/video feedback to refine your narrative before presentation.</h3>
            <span>Pitch Prep · Real-time Feedback</span>
          </div>
        </article>

        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="/IDE.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>FastMCP Integration & Context Server</p>
            <h3>Seamlessly connect AI coding assistants directly to your backend workspace using our native Model Context Protocol (FastMCP) server.</h3>
            <span>Development · FastMCP Server</span>
          </div>
        </article>

        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="/hack-coach-demo.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>AI Strategic Hack Coach</p>
            <h3>Get 24/7 strategic guidance, task decomposition, and problem statement analysis tailored to hackathon judge rubrics.</h3>
            <span>Strategy · 24/7 Guidance</span>
          </div>
        </article>

        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="/ppt-demo.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>AI Presentation Engine & Mem0 Memory</p>
            <h3>Instantly convert project outlines into exported PPTX, PDF, and web slides powered by real-time SSE streaming and Mem0 vector memory.</h3>
            <span>Presentation · SSE Streaming & Mem0</span>
          </div>
        </article>
      </div>

      <div className="video-stories__footer" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <strong>05 / 05</strong>
      </div>
    </section>
  );
}
