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
        <h2 id="video-stories-title">Hackathon stories from teams that shipped with HAC-KIT AI.</h2>
        <p>
          Short field notes from captains, builders, and pitchers who used AI agents to move from
          problem statement to working demo — and made it to the finals.
        </p>
      </div>

      <div className="video-stories__rail" ref={railRef} aria-label="HAC-KIT AI success stories">
        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="https://plugin-assets.open-design.ai/plugins/aerocore/hf_20260324_032431_5e054107-51c0-4162-9f0f-3a40054761ef-424242.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>Problem to Prototype</p>
            <h3>How a first-time team went from blank page to working MVP in under 12 hours.</h3>
            <span>Health hackathon · 04:20</span>
          </div>
        </article>

        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="https://plugin-assets.open-design.ai/plugins/aerocore/hf_20260324_032535_4ccc152e-0cc8-4ee5-a698-e1a98cea8a1e-866873.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>Pitch Coaching</p>
            <h3>The agent that turned a messy build log into a winning 3-minute pitch narrative.</h3>
            <span>Fintech hackathon · 03:45</span>
          </div>
        </article>

        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="/IDE.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>Multi-Agent Architecture</p>
            <h3>Three AI agents collaborating in real-time to ship a full-stack app in 24 hours.</h3>
            <span>AI hackathon · 05:10</span>
          </div>
        </article>

        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="https://plugin-assets.open-design.ai/plugins/aerocore/hf_20260324_032431_5e054107-51c0-4162-9f0f-3a40054761ef-424242.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>Strategy First</p>
            <h3>How problem analysis and task decomposition gave one team a 2-hour head start.</h3>
            <span>Sustainability track · 04:55</span>
          </div>
        </article>

        <article className="story-card">
          <video className="story-card__media" autoPlay muted loop playsInline>
            <source src="https://plugin-assets.open-design.ai/plugins/aerocore/hf_20260324_032535_4ccc152e-0cc8-4ee5-a698-e1a98cea8a1e-866873.mp4" type="video/mp4" />
          </video>
          <div className="story-card__content">
            <p>From Zero to Podium</p>
            <h3>A solo developer with no team — and how HAC-KIT AI became their co-founder.</h3>
            <span>Open category · 03:30</span>
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
