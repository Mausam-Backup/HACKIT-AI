"use client";

import { useEffect, useState, useRef } from "react";

const DATASETS: Record<
  string,
  {
    title: string;
    summary: string;
    bars: {
      label: string;
      value: number;
      target: number;
      rangeStart: number;
      rangeEnd: number;
      unit: string;
      note: string;
      trace: number[];
    }[];
  }
> = {
  problems: {
    title: "Core Modules Precision",
    summary: "HAC-KIT AI's suite of specialized autonomous agents delivers end-to-end execution — from initial problem decomposition to investor-ready pitch decks.",
    bars: [
      { label: "AI Hack Coach (Decomposition)", value: 96, target: 98, rangeStart: 72, rangeEnd: 99, unit: "%", note: "task breakdown precision", trace: [58, 70, 80, 86, 92, 96] },
      { label: "Generative Pitch Synthesizer", value: 94, target: 97, rangeStart: 68, rangeEnd: 98, unit: "%", note: "deck completion rate", trace: [50, 64, 76, 84, 90, 94] },
      { label: "Predictive Pitch Engine (Interviews)", value: 91, target: 95, rangeStart: 60, rangeEnd: 96, unit: "%", note: "real-time feedback score", trace: [42, 56, 70, 80, 86, 91] },
      { label: "Enterprise Local CLI", value: 98, target: 99, rangeStart: 80, rangeEnd: 100, unit: "%", note: "zero-latency execution", trace: [68, 78, 86, 92, 96, 98] },
    ],
  },
  tech: {
    title: "Tech Stack Integration",
    summary: "Our local 8B parameter fine-tuned model natively supports all core hackathon stacks with zero third-party dependency.",
    bars: [
      { label: "Next.js & React Frontend", value: 96, target: 98, rangeStart: 75, rangeEnd: 99, unit: "%", note: "full-stack UI generation", trace: [60, 72, 82, 88, 93, 96] },
      { label: "Python & FastAPI Backend", value: 94, target: 97, rangeStart: 70, rangeEnd: 98, unit: "%", note: "API & ML pipeline", trace: [52, 66, 78, 85, 90, 94] },
      { label: "Tailwind CSS Design Tokens", value: 92, target: 95, rangeStart: 65, rangeEnd: 96, unit: "%", note: "instant responsive styling", trace: [45, 60, 72, 80, 87, 92] },
      { label: "REST & WebSocket Protocols", value: 95, target: 98, rangeStart: 72, rangeEnd: 99, unit: "%", note: "real-time architecture", trace: [55, 68, 79, 86, 91, 95] },
    ],
  },
  teams: {
    title: "AI Coach & Team Dynamics",
    summary: "Dynamic task decomposition and automated strategic orchestration double development velocity while reducing friction.",
    bars: [
      { label: "Development Velocity", value: 94, target: 97, rangeStart: 70, rangeEnd: 98, unit: "%", note: "vs unassisted teams", trace: [48, 62, 74, 83, 89, 94] },
      { label: "Problem Statement Alignment", value: 92, target: 96, rangeStart: 65, rangeEnd: 97, unit: "%", note: "judge rubric match", trace: [44, 58, 70, 80, 87, 92] },
      { label: "Pitch Narrative Clarity", value: 96, target: 99, rangeStart: 75, rangeEnd: 100, unit: "%", note: "adversarial prep score", trace: [60, 72, 82, 89, 93, 96] },
      { label: "On-Time MVP Completion", value: 98, target: 100, rangeStart: 82, rangeEnd: 100, unit: "%", note: "submitting before deadline", trace: [70, 80, 88, 93, 96, 98] },
    ],
  },
  success: {
    title: "Hackathon Podium Metrics",
    summary: "Teams and solo builders leveraging HAC-KIT AI achieve significantly higher submission rates and podium finishes globally.",
    bars: [
      { label: "Project Submission Rate", value: 98, target: 100, rangeStart: 80, rangeEnd: 100, unit: "%", note: "100% completed on time", trace: [72, 82, 89, 94, 97, 98] },
      { label: "Podium / Top-3 Finish Rate", value: 89, target: 94, rangeStart: 60, rangeEnd: 95, unit: "%", note: "judge favorite selection", trace: [38, 52, 66, 76, 83, 89] },
      { label: "Technical Depth Rating", value: 93, target: 97, rangeStart: 68, rangeEnd: 98, unit: "%", note: "architecture score lift", trace: [50, 64, 76, 84, 89, 93] },
      { label: "Pitch Score Improvement", value: 95, target: 98, rangeStart: 72, rangeEnd: 99, unit: "%", note: "vs baseline presentation", trace: [56, 70, 80, 87, 92, 95] },
    ],
  },
};

export default function StatsSection() {
  const [activeKey, setActiveKey] = useState("problems");
  const [isReady, setIsReady] = useState(false);

  // When activeKey changes, we delay setting isReady to trigger the CSS transition
  useEffect(() => {
    setIsReady(false);
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 140);
    return () => clearTimeout(timer);
  }, [activeKey]);

  const data = DATASETS[activeKey];

  return (
    <section className="stats" id="our-edge" aria-labelledby="stats-title">
      <div className="stats__header">
        <div className="stats__title-wrap">
          <h2 id="stats-title">Data-driven hackathon intelligence powering every stage of your build.</h2>
        </div>
        <p
          className={`stats__summary ${isReady ? "is-visible" : ""}`}
          data-stats-summary
        >
          {data.summary}
        </p>
      </div>

      <div className="stats__tabs" role="tablist" aria-label="Statistics categories">
        <button
          className={`stats__tab ${activeKey === "problems" ? "is-active" : ""}`}
          type="button"
          role="tab"
          aria-selected={activeKey === "problems"}
          onClick={() => setActiveKey("problems")}
        >
          Problem Domains
        </button>
        <button
          className={`stats__tab ${activeKey === "tech" ? "is-active" : ""}`}
          type="button"
          role="tab"
          aria-selected={activeKey === "tech"}
          onClick={() => setActiveKey("tech")}
        >
          Tech Stack
        </button>
        <button
          className={`stats__tab ${activeKey === "teams" ? "is-active" : ""}`}
          type="button"
          role="tab"
          aria-selected={activeKey === "teams"}
          onClick={() => setActiveKey("teams")}
        >
          Team Dynamics
        </button>
        <button
          className={`stats__tab ${activeKey === "success" ? "is-active" : ""}`}
          type="button"
          role="tab"
          aria-selected={activeKey === "success"}
          onClick={() => setActiveKey("success")}
        >
          Success Rate
        </button>
      </div>

      <div
        className={`stats__chart ${isReady ? "is-ready" : ""}`}
        data-stats-chart
        aria-live="polite"
      >
        <div className="stats__chart-head">
          <span>{data.title}</span>
          <strong>Performance metric</strong>
        </div>
        <div className="stats__bars">
          {data.bars.map((bar, index) => (
            <article
              key={index}
              className="stats__bar-row"
              style={{
                "--bar-value": `${bar.value}%`,
                "--range-start": `${bar.rangeStart}%`,
                "--range-width": `${bar.rangeEnd - bar.rangeStart}%`,
                "--bar-delay": `${index * 90}ms`,
              } as React.CSSProperties}
            >
              <div className="stats__bar-label">
                <strong>{bar.label}</strong>
                <span>{bar.note}</span>
              </div>
              <div className="stats__track" aria-hidden="true">
                <div className="stats__range"></div>
                <div className="stats__bar"></div>
                <span className="stats__value">{bar.value}{bar.unit}</span>
                <div className="stats__trace">
                  {bar.trace.map((point, pointIndex) => (
                    <i
                      key={pointIndex}
                      className={`stats__spark stats__spark--${pointIndex % 3}`}
                      style={{
                        "--point-x": `${Math.min(point, bar.value - 3)}%`,
                        "--point-y": `${pointIndex % 2 === 0 ? 34 : 62}%`,
                        "--point-delay": `${pointIndex * 70}ms`,
                      } as React.CSSProperties}
                    ></i>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="stats__axis" aria-hidden="true">
          <span></span>
          <div>
            {Array.from({ length: 11 }, (_, i) => (
              <span key={i}>{i * 10}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
