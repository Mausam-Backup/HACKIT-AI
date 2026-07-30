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
    title: "Problem Domains",
    summary: "HAC-KIT AI analyzes problem statements across categories — from social impact to fintech to hardware — extracting constraints and opportunities.",
    bars: [
      { label: "Social impact & education", value: 84, target: 90, rangeStart: 62, rangeEnd: 93, unit: "%", note: "coverage accuracy", trace: [42, 56, 68, 74, 79, 84] },
      { label: "Fintech & blockchain", value: 76, target: 82, rangeStart: 48, rangeEnd: 87, unit: "%", note: "domain parsing", trace: [28, 40, 53, 62, 70, 76] },
      { label: "Health & biotech", value: 68, target: 76, rangeStart: 38, rangeEnd: 80, unit: "%", note: "successful matches", trace: [16, 30, 42, 52, 62, 68] },
      { label: "AI & ML challenges", value: 92, target: 96, rangeStart: 72, rangeEnd: 98, unit: "%", note: "coverage accuracy", trace: [58, 68, 76, 82, 88, 92] },
    ],
  },
  tech: {
    title: "Tech Stack Readiness",
    summary: "Our agents adapt to the most popular hackathon tech stacks, generating idiomatic code across languages and frameworks.",
    bars: [
      { label: "Python / FastAPI", value: 94, target: 97, rangeStart: 78, rangeEnd: 99, unit: "%", note: "code generation", trace: [62, 72, 82, 87, 91, 94] },
      { label: "React / Next.js", value: 88, target: 92, rangeStart: 64, rangeEnd: 95, unit: "%", note: "component generation", trace: [40, 54, 68, 76, 84, 88] },
      { label: "TypeScript / Node", value: 82, target: 88, rangeStart: 56, rangeEnd: 92, unit: "%", note: "type-safe output", trace: [33, 46, 58, 69, 77, 82] },
      { label: "Mobile (Flutter / RN)", value: 74, target: 81, rangeStart: 48, rangeEnd: 86, unit: "%", note: "cross-platform", trace: [25, 38, 50, 60, 68, 74] },
    ],
  },
  teams: {
    title: "Team Dynamics",
    summary: "Team composition, role distribution, and communication patterns directly predict hackathon outcomes. HAC-KIT AI optimizes all three.",
    bars: [
      { label: "Role clarity", value: 86, target: 91, rangeStart: 60, rangeEnd: 94, unit: "%", note: "task ownership", trace: [46, 58, 68, 74, 81, 86] },
      { label: "Code velocity", value: 78, target: 84, rangeStart: 52, rangeEnd: 88, unit: "%", note: "vs unassisted", trace: [30, 42, 56, 66, 73, 78] },
      { label: "Conflict resolution", value: 72, target: 79, rangeStart: 44, rangeEnd: 84, unit: "%", note: "agent mediation", trace: [22, 34, 46, 58, 66, 72] },
      { label: "Pitch readiness", value: 91, target: 95, rangeStart: 68, rangeEnd: 98, unit: "%", note: "coaching lift", trace: [54, 66, 76, 82, 88, 91] },
    ],
  },
  success: {
    title: "Success Rate",
    summary: "Teams using HAC-KIT AI consistently outperform unassisted teams across submission rates, technical depth, and podium finishes.",
    bars: [
      { label: "Submission completion", value: 93, target: 96, rangeStart: 72, rangeEnd: 99, unit: "%", note: "vs 68% baseline", trace: [58, 70, 78, 84, 90, 93] },
      { label: "Top-3 finish rate", value: 67, target: 74, rangeStart: 38, rangeEnd: 80, unit: "%", note: "podium presence", trace: [22, 34, 46, 54, 62, 67] },
      { label: "Judge score impact", value: 82, target: 88, rangeStart: 56, rangeEnd: 93, unit: "%", note: "avg improvement", trace: [40, 52, 62, 72, 78, 82] },
      { label: "Returning team rate", value: 76, target: 82, rangeStart: 48, rangeEnd: 88, unit: "%", note: "retention", trace: [30, 42, 56, 64, 71, 76] },
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
          <h2 id="stats-title">Data-driven hackathon intelligence across every phase.</h2>
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
