"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Presentation } from "lucide-react"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const pitchDeckSteps = [
  {
    num: "01",
    title: "The Hook & Problem Statement",
    desc: "Identify target user bottlenecks, quantify the friction coefficient, and parse problem constraints.",
    items: [
      { title: "Identify core user pain points and system bottlenecks" },
      { title: "LiteParse document parsing for automated problem extraction" },
      { title: "Mem0 vector embeddings to classify domain constraints & urgency" }
    ]
  },
  {
    num: "02",
    title: "System Architecture & Solution",
    desc: "Your value proposition backed by a robust, scalable system design pattern.",
    items: [
      { title: "State your core product value proposition and system scope" },
      { title: "Expose FastMCP (Model Context Protocol) tool-calling endpoints" },
      { title: "Define high-concurrency async task handling & state routing" }
    ]
  },
  {
    num: "03",
    title: "Live Demo & SSE Streaming",
    desc: "Show, don't just tell. Demonstrate real-time UI state transitions and data flows.",
    items: [
      { title: "Live walk-through with Server-Sent Events (SSE) streaming" },
      { title: "Real-time AI Pitch Interview simulator with audio/video feedback" },
      { title: "Display FastAPI & Next.js proxy communication live" }
    ]
  },
  {
    num: "04",
    title: "Tech Stack & Security Layer",
    desc: "Backend services, database migrations, security isolation, and API architecture.",
    items: [
      { title: "FastAPI, Next.js, SQLite/SQLAlchemy, and FastEmbed embeddings" },
      { title: "Express.js 2FA authentication microservice & session tokens" },
      { title: "Environment isolation for zero-knowledge API key security" }
    ]
  },
  {
    num: "05",
    title: "Multi-Format Export & Roadmap",
    desc: "Automated presentation exports and post-hackathon scalability path.",
    items: [
      { title: "Multi-format export engine (PPTX, PDF, HTML, Markdown)" },
      { title: "Mem0 vector memory persistence for session continuity" },
      { title: "Extensible agent tool-call registry for future feature deployment" }
    ]
  },
]

export default function PitchBlueprint() {
  const pitchRefs = useRef<(HTMLDivElement | null)[]>([])
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 48rem)")
    setIsDesktop(mediaQuery.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  useGSAP(() => {
    pitchRefs.current.forEach((el) => {
      if (!el) return
      gsap.from(el, {
        y: 200,
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
        },
        duration: 1,
        ease: "circ.out",
      })
    })
  }, [])

  return (
    <section className="py-24 bg-[#AEE9FA] relative z-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col gap-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-white text-sm font-semibold w-fit">
            <Presentation className="size-4" />
            <span>Hackathon Technical Pitching</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 tracking-tight leading-none">
            Pitching, Presentations & Technical Decks
          </h2>
          <p className="text-lg text-zinc-800 max-w-2xl font-medium">
            Judges scoring criteria, FastMCP context specs, SSE streaming demos, and presentation blueprints
          </p>
        </div>
      </div>

      {/* Interactive 5-Slide Pitch Blueprint Banner (Full Width) */}
      <div className="mt-8 w-full">
        <div className="container mx-auto px-4 max-w-7xl mb-12 flex flex-col gap-4">
          <h3 className="text-4xl md:text-5xl font-medium text-zinc-950 leading-tight">
            The 5-Slide Technical Pitch Blueprint
          </h3>
          <p className="text-zinc-800 text-lg md:text-xl font-medium tracking-widest max-w-2xl text-pretty">
            The step-by-step presentation structure recommended by hackathon judges, backed by FastMCP and Mem0 vector memory.
          </p>
        </div>

        <div className="relative pb-12 w-full">
          {pitchDeckSteps.map((step, index) => (
            <div
              ref={(el) => {
                pitchRefs.current[index] = el
              }}
              key={step.num}
              className="sticky pt-8 pb-12 text-zinc-950 bg-[#AEE9FA] border-t border-zinc-900/10 w-full"
              style={
                isDesktop
                  ? {
                      top: `calc(10vh + ${index * 6.5}em)`,
                    }
                  : { top: 0 }
              }
            >
              <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex flex-col md:flex-row items-start gap-6 md:gap-12 font-medium">
                  <span className="text-6xl md:text-7xl font-black text-zinc-900/10">
                    {step.num}
                  </span>
                  <div className="flex flex-col gap-4 w-full">
                    <h2 className="text-3xl lg:text-5xl font-serif text-zinc-900">{step.title}</h2>
                    <p className="text-xl lg:text-2xl text-zinc-700 tracking-widest leading-relaxed text-pretty font-medium">
                      {step.desc}
                    </p>
                    
                    <div className="flex flex-col gap-2 mt-4 md:mt-8 text-xl sm:gap-4 lg:text-2xl text-zinc-900 w-full">
                      {step.items.map((item, itemIndex) => (
                        <div key={`item-${index}-${itemIndex}`} className="w-full">
                          <h3 className="flex items-start">
                            <span className="mr-6 md:mr-12 text-sm lg:text-base mt-1 text-zinc-950/40 font-bold">
                              0{itemIndex + 1}
                            </span>
                            <span className="font-medium tracking-wide">{item.title}</span>
                          </h3>
                          {itemIndex < step.items.length - 1 && (
                            <div className="w-full h-px my-4 md:my-6 bg-zinc-950/10" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
