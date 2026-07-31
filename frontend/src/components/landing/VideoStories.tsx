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
        {/* Highlight 1: Pitch Simulator (High interactive visual wow factor) */}
        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="/ai-interview-demo.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>01 · AI Pitch Interview Simulator</p>
            <h3>Practice your hackathon pitch with interactive AI interviewers. Receive real-time audio/video feedback to refine your narrative before presentation.</h3>
            <span>Pitch Prep · Real-time Feedback</span>
          </div>
        </article>

        {/* Highlight 2: Presentation Engine (Generative AI wow factor) */}
        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="/ppt-demo.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>02 · AI Presentation Engine & Mem0 Memory</p>
            <h3>Instantly convert project outlines into exported PPTX, PDF, and web slides powered by real-time SSE streaming and Mem0 vector memory.</h3>
            <span>Presentation · SSE Streaming & Mem0</span>
          </div>
        </article>

        {/* Highlight 3: App Builder CLI (Multi-agent autonomous code gen) */}
        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="/hac-kit cli demo.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>03 · App Builder CLI &amp; Multi-Agent Orchestrator</p>
            <h3>Autonomously generate a complete full-stack project from a single prompt using 6 specialized AI agents — Coach, Builder, Validator, and Pitch Generator.</h3>
            <span>Code Gen · Multi-Agent Pipeline</span>
          </div>
        </article>

        {/* Highlight 4: AI Workflow & Automation (Core multi-agent feature) */}
        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="/Ai-automation.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>04 · AI Workflow & Automation</p>
            <h3>Streamline your hackathon building process with specialized AI agents handling repetitive tasks, testing, and deployment.</h3>
            <span>Automation · Agentic Workflows</span>
          </div>
        </article>

        {/* Highlight 5: AI Hack Coach */}
        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="/hack-coach-demo.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>05 · AI Strategic Hack Coach</p>
            <h3>Get 24/7 strategic guidance, task decomposition, and problem statement analysis tailored to hackathon judge rubrics.</h3>
            <span>Strategy · 24/7 Guidance</span>
          </div>
        </article>

        {/* Highlight 6: Resource Hub */}
        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="/resources and hacakthons.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>06 · Hackathons & Resource Hub</p>
            <h3>Discover global hackathons and access curated developer toolkits, starter templates, and API documentation in one centralized portal.</h3>
            <span>Discovery · Curated Toolkits</span>
          </div>
        </article>
      </div>

      <div className="video-stories__footer" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <strong>06 / 06</strong>
      </div>
    </section>
  );
}
