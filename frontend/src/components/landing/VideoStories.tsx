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
            <p>Global Hackathon Neural Network</p>
            <h3>Access an enterprise-grade curated pipeline of tier-1 hackathons, integrated directly into your workflow with zero-friction onboarding.</h3>
            <span>Discovery · Always Updated</span>
          </div>
        </article>

        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="/ai-interview-demo.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>Predictive Pitch Engine</p>
            <h3>Real-time NLP analysis and adversarial interview simulations powered by our proprietary conversational AI to perfect your narrative.</h3>
            <span>Pitch Prep · Real-time Feedback</span>
          </div>
        </article>

        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="/IDE.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>Enterprise-Grade AI CLI</p>
            <h3>Powered by our custom fine-tuned 8-billion parameter foundation model running completely locally on-device. Zero-latency context switching entirely independent of third-party APIs.</h3>
            <span>Development · Local LLM</span>
          </div>
        </article>

        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="/hack-coach-demo.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>Autonomous Strategic Orchestrator</p>
            <h3>Leverage our fine-tuned reasoning models for dynamic task decomposition, deterministic problem analysis, and 24/7 strategic guidance.</h3>
            <span>Strategy · 24/7 Guidance</span>
          </div>
        </article>

        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="/ppt-demo.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>Generative Pitch Deck Synthesizer</p>
            <h3>Instantly compile multi-modal code representations into stunning, investor-ready presentations with our advanced automated design engine.</h3>
            <span>Pitch Deck · Automated</span>
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
