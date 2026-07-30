"use client";

import { useEffect, useRef } from "react";

const TABS = [
  {
    num: "01",
    label: "Problem Analysis",
    title: "Parse & Prioritize<br>Problem Statements",
    desc: "Our AI analyzes hackathon problem statements against your team's skills, extracting constraints, success criteria, and the fastest path to a viable prototype.",
  },
  {
    num: "02",
    label: "Strategy Engine",
    title: "Plan Your Approach<br>in Minutes",
    desc: "Generate a complete strategy map — tech stack recommendations, task breakdown, timeline estimation, and risk assessment — tailored to your team size and domain.",
  },
  {
    num: "03",
    label: "Code Co-Pilot",
    title: "Multi-Agent Code<br>Generation",
    desc: "A team of specialized LLM agents collaborates on your codebase: architect, implementer, reviewer, and tester working in parallel to ship features fast.",
  },
  {
    num: "04",
    label: "Pitch Perfect",
    title: "From Build Log<br>to Winning Pitch",
    desc: "Automatically transform your development log, demo artifacts, and impact metrics into a polished pitch deck — with narrative coaching from AI advisors.",
  },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function Showcase() {
  const showcaseRef = useRef<HTMLElement>(null);
  const filmRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const el = showcaseRef.current;
    if (!el) return;

    const missionMedia = document.querySelector(".mission__media") as HTMLElement;

    // Create film
    const film = document.createElement("div");
    film.className = "showcase-film";
    film.innerHTML = `
      <video class="showcase-film__video" autoplay muted loop playsinline poster="/hackathon-1.JPG">
        <source src="/hacakthon-video.mp4" type="video/mp4" />
      </video>
      <div class="showcase-film__overlay"></div>
    `;
    document.body.appendChild(film);
    filmRef.current = film;
    const filmOverlay = film.querySelector(".showcase-film__overlay") as HTMLElement;

    const ui = el.querySelector(".showcase__ui") as HTMLElement;
    const panels = el.querySelectorAll(".showcase__panel");
    const tabs = el.querySelectorAll(".showcase__tab");

    let isStartLocked = false;
    let expandStartScrollY = 0;
    let startRect: { top: number; left: number; width: number; height: number; radius: number } | null = null;

    const cardToRect = (mr: DOMRect) => ({ top: mr.top, left: mr.left, width: mr.width, height: mr.height, radius: 0 });

    const applyRect = (r: { top: number; left: number; width: number; height: number; radius: number }) => {
      film.style.top = `${r.top.toFixed(2)}px`;
      film.style.left = `${r.left.toFixed(2)}px`;
      film.style.width = `${r.width.toFixed(2)}px`;
      film.style.height = `${r.height.toFixed(2)}px`;
      film.style.borderRadius = `${r.radius.toFixed(2)}px`;
    };

    const loop = () => {
      const vh = window.innerHeight;
      const rect = el.getBoundingClientRect();
      const scrolled = -rect.top;
      const totalScroll = Math.max(el.offsetHeight - vh, 1);
      let missionMediaVisible = false;
      let missionMediaPending = false;

      if (rect.bottom <= 0) {
        film.style.opacity = "0";
        filmOverlay.style.opacity = "0";
        ui.style.opacity = "0";
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      if (missionMedia) {
        const mr = missionMedia.getBoundingClientRect();
        missionMediaVisible = mr.width > 0 && mr.height > 0 && mr.bottom > 0 && mr.top < vh;
        missionMediaPending = mr.width > 0 && mr.height > 0 && mr.top >= vh;

        if (missionMediaVisible && scrolled <= 0) {
          const mediaCenterY = mr.top + mr.height / 2;
          if (mediaCenterY > vh / 2) {
            isStartLocked = false;
            expandStartScrollY = 0;
          }
          if (mediaCenterY <= vh / 2 || isStartLocked) {
            if (!isStartLocked) {
              expandStartScrollY = window.scrollY;
            }
            isStartLocked = true;
            startRect = cardToRect(mr);
          } else {
            startRect = cardToRect(mr);
          }
        }
      }

      if (!isStartLocked) {
        if (missionMediaPending) {
          startRect = null;
          expandStartScrollY = 0;
        }
        if (startRect) {
          applyRect(startRect);
        }
        film.style.opacity = startRect ? "1" : "0";
        filmOverlay.style.opacity = "0";
        ui.style.opacity = "0";
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      const expandP = clamp((window.scrollY - expandStartScrollY) / vh, 0, 1);
      const eased = easeOutCubic(expandP);
      film.style.opacity = "1";

      const sr = startRect || { top: vh * 0.21, left: window.innerWidth * 0.38, width: window.innerWidth * 0.58, height: vh * 0.58, radius: 0 };
      applyRect({
        top: lerp(sr.top, 0, eased),
        left: lerp(sr.left, 0, eased),
        width: lerp(sr.width, window.innerWidth, eased),
        height: lerp(sr.height, vh, eased),
        radius: lerp(sr.radius, 0, eased),
      });

      filmOverlay.style.opacity = String((eased * 0.22).toFixed(3));

      if (expandP < 1) {
        ui.style.opacity = "0";
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      const progress = clamp(scrolled / totalScroll, 0, 1);
      const uiP = clamp(progress / 0.08, 0, 1);
      ui.style.opacity = String(easeInOutCubic(uiP).toFixed(3));

      const TAB_START = 0.08;
      const tabP = clamp((progress - TAB_START) / (1 - TAB_START), 0, 1);
      const activeTab = clamp(Math.floor(tabP * TABS.length), 0, TABS.length - 1);

      panels.forEach((p, i) => {
        const active = i === activeTab;
        p.classList.toggle("is-active", active);
        p.setAttribute("aria-hidden", String(!active));
      });
      tabs.forEach((t, i) => {
        const active = i === activeTab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });

      frameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(frameRef.current);
      if (filmRef.current && document.body.contains(filmRef.current)) {
        document.body.removeChild(filmRef.current);
      }
    };
  }, []);

  return (
    <section className="showcase" id="technology" aria-label="Technology highlights" ref={showcaseRef}>
      <div className="showcase__sticky">
        <div className="showcase__ui" aria-live="polite">
          <div className="showcase__panels">
            {TABS.map((t, i) => (
              <div
                key={i}
                className={`showcase__panel${i === 0 ? " is-active" : ""}`}
                data-index={i}
                aria-hidden={i !== 0}
              >
                <span className="showcase__panel-num">{t.num}</span>
                <h2
                  className="showcase__panel-title"
                  dangerouslySetInnerHTML={{ __html: t.title }}
                ></h2>
                <p className="showcase__panel-desc">{t.desc}</p>
              </div>
            ))}
          </div>
          <nav className="showcase__tabs-nav" aria-label="Technology sections">
            {TABS.map((t, i) => (
              <div
                key={i}
                className={`showcase__tab${i === 0 ? " is-active" : ""}`}
                data-index={i}
                role="tab"
                aria-selected={i === 0}
              >
                <span className="showcase__tab-bar" aria-hidden="true"></span>
                <span className="showcase__tab-name">{t.label}</span>
                <span className="showcase__tab-num">{t.num}</span>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
