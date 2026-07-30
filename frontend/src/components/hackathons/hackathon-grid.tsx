/* eslint-disable @next/next/no-img-element */
"use client"

import type { Hackathon } from "@/types/hackathons"
import { SearchX, AlertCircle, RefreshCw, ArrowUpRight, Calendar, MapPin, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef, useState } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { HackathonCard, cleanHtml } from "./hackathon-card"

interface HackathonGridProps {
  hackathons: Hackathon[]
  isLoading: boolean
  error?: Error | null
  viewMode?: "list" | "grid"
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5 space-y-4 animate-pulse shadow-sm">
      <div className="h-48 w-full bg-zinc-200/70 rounded-2xl" />
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-zinc-200/70 rounded-lg" />
        <div className="h-4 w-1/2 bg-zinc-200/70 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-4 bg-zinc-200/70 rounded" />
        <div className="h-4 bg-zinc-200/70 rounded" />
      </div>
      <div className="h-10 bg-zinc-200/70 rounded-xl mt-4" />
    </div>
  )
}

export function HackathonGrid({
  hackathons,
  isLoading,
  error,
  viewMode = "list",
}: HackathonGridProps) {
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([])
  const previewRef = useRef<HTMLDivElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)

  const mouse = useRef({ x: -9999, y: -9999 })
  const moveX = useRef<gsap.QuickToFunc | null>(null)
  const moveY = useRef<gsap.QuickToFunc | null>(null)

  useGSAP(() => {
    if (viewMode === "list" && previewRef.current) {
      moveX.current = gsap.quickTo(previewRef.current, "x", {
        duration: 0.35,
        ease: "power2.out",
      })
      moveY.current = gsap.quickTo(previewRef.current, "y", {
        duration: 0.35,
        ease: "power2.out",
      })
    }

    if (viewMode === "list" && !isLoading && !error && hackathons && hackathons.length > 0) {
      gsap.from(".hackathon-row", {
        y: 30,
        opacity: 0,
        delay: 0.05,
        duration: 0.6,
        stagger: 0.04,
        ease: "power2.out",
      })
    }
  }, [hackathons, isLoading, error, viewMode])

  const handleMouseEnter = (index: number, e?: React.MouseEvent) => {
    if (window.innerWidth < 768) return
    setCurrentIndex(index)

    if (e && previewRef.current) {
      const posX = Math.min(e.clientX + 20, window.innerWidth - 380)
      const posY = Math.min(e.clientY + 20, window.innerHeight - 240)
      mouse.current.x = posX
      mouse.current.y = posY
      gsap.set(previewRef.current, { x: posX, y: posY })
    }

    const el = overlayRefs.current[index]
    if (el) {
      gsap.killTweensOf(el)
      gsap.fromTo(
        el,
        {
          clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
        },
        {
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
          duration: 0.15,
          ease: "power2.out",
        }
      )
    }

    if (previewRef.current) {
      gsap.to(previewRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
        overwrite: "auto",
      })
    }
  }

  const handleMouseLeave = (index: number) => {
    if (window.innerWidth < 768) return

    const el = overlayRefs.current[index]
    if (el) {
      gsap.killTweensOf(el)
      gsap.to(el, {
        clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
        duration: 0.15,
        ease: "power2.in",
      })
    }

    if (previewRef.current) {
      gsap.to(previewRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.2,
        ease: "power2.out",
        overwrite: "auto",
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (window.innerWidth < 768) return
    const posX = Math.min(e.clientX + 20, window.innerWidth - 380)
    const posY = Math.min(e.clientY + 20, window.innerHeight - 240)
    mouse.current.x = posX
    mouse.current.y = posY
    if (moveX.current) moveX.current(posX)
    if (moveY.current) moveY.current(posY)
  }

  const handleContainerMouseLeave = () => {
    setCurrentIndex(null)
    if (previewRef.current) {
      gsap.to(previewRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.2,
        ease: "power2.out",
        overwrite: "auto",
      })
    }
  }

  if (isLoading) {
    if (viewMode === "grid") {
      return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 px-6 md:px-12 py-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-6 py-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[420px] items-center justify-center p-8 mx-6 md:mx-12 rounded-3xl border border-red-500/20 bg-red-500/5 text-center">
        <div className="flex flex-col items-center max-w-md gap-4">
          <div className="rounded-2xl bg-red-500/10 p-4 text-red-500">
            <AlertCircle className="size-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-black mb-1">Failed to load hackathons</h3>
            <p className="text-sm text-black/70">
              We encountered an issue fetching the latest hackathons list. Please verify your connection or try again.
            </p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-black text-white hover:bg-black/80 font-semibold text-sm gap-2 px-6"
          >
            <RefreshCw className="size-4" />
            Retry Connection
          </Button>
        </div>
      </div>
    )
  }

  if (!hackathons || hackathons.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center p-8 mx-6 md:mx-12 rounded-3xl border border-black/10 bg-black/5 text-center">
        <div className="flex flex-col items-center max-w-md gap-4">
          <div className="rounded-3xl bg-black/10 p-5 text-black">
            <SearchX className="size-12" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-black mb-1">No Hackathons Found</h3>
            <p className="text-sm text-black/70">
              No active hackathons found matching your query or filters. Try clearing your search!
            </p>
          </div>
        </div>
      </div>
    )
  }

  // --- RICH GRID VIEW MODE (Show Details) ---
  if (viewMode === "grid") {
    return (
      <div className="px-6 md:px-12 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hackathons.map((hackathon, index) => (
            <HackathonCard
              key={hackathon._id || hackathon.id ? `${hackathon._id || hackathon.id}-${index}` : index}
              hackathon={hackathon}
              index={index}
            />
          ))}
        </div>
      </div>
    )
  }

  // --- MINIMAL LIST VIEW MODE ---
  return (
    <div
      className="relative flex flex-col font-light w-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleContainerMouseLeave}
    >
      {/* Top divider before first row */}
      <div className="w-full h-0.5 bg-black" />

      {hackathons.map((hackathon, index) => {
        const cleanTitle = cleanHtml(hackathon.title) || "Hackathon Event"
        const cleanOrg = cleanHtml(hackathon.organization_name) || "Organization"
        const cleanLoc = cleanHtml(hackathon.displayed_location)
        const cleanDates = cleanHtml(hackathon.submission_period_dates)
        const cleanPrize = cleanHtml(hackathon.prizeText)

        return (
          <div
            key={hackathon._id || hackathon.id ? `${hackathon._id || hackathon.id}-${index}` : index}
            className="hackathon-row relative flex flex-col gap-1 py-5 cursor-pointer group md:gap-0 overflow-hidden"
            onMouseEnter={(e) => handleMouseEnter(index, e)}
            onMouseLeave={() => handleMouseLeave(index)}
            onClick={() => window.open(hackathon.url, "_blank")}
          >
            {/* Hover overlay background - ONLY shows black when hovered */}
            <div
              ref={(el) => {
                overlayRefs.current[index] = el
              }}
              style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
              className="absolute inset-0 hidden md:block bg-zinc-950 z-0 pointer-events-none"
            />

            {/* Title & Arrow */}
            <div className="relative z-10 flex justify-between px-6 md:px-10 text-black transition-all duration-500 md:group-hover:px-12 md:group-hover:text-white">
              <h2 className="lg:text-[32px] text-[26px] leading-none font-normal truncate max-w-[90%]">
                {cleanTitle}
              </h2>
              <ArrowUpRight className="md:size-6 size-5 shrink-0" />
            </div>

            {/* Divider inside row */}
            <div className="relative z-10 w-full h-0.5 bg-black/80 mt-4 md:mt-0 md:group-hover:bg-white/20 transition-colors duration-500" />

            {/* Details bar */}
            <div className="relative z-10 flex flex-wrap items-center px-6 md:px-10 text-xs leading-loose uppercase transition-all duration-500 md:text-sm gap-x-5 gap-y-2 md:group-hover:px-12 mt-2">
              <p className="text-black font-medium transition-colors duration-500 md:group-hover:text-white">
                {cleanOrg}
              </p>

              {cleanLoc !== "" && (
                <div className="flex items-center gap-1.5 text-black transition-colors duration-500 md:group-hover:text-white">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{cleanLoc}</span>
                </div>
              )}

              {cleanDates !== "" && (
                <div className="flex items-center gap-1.5 text-black transition-colors duration-500 md:group-hover:text-white">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{cleanDates}</span>
                </div>
              )}

              {cleanPrize !== "" && (
                <div className="flex items-center gap-1.5 text-black transition-colors duration-500 md:group-hover:text-white">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{cleanPrize}</span>
                </div>
              )}
            </div>

            {/* Mobile preview image */}
            <div className="relative flex items-center justify-center px-6 md:hidden h-[240px] mt-4">
              <img
                src={
                  hackathon.thumbnail_url ||
                  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1740&auto=format&fit=crop"
                }
                alt={`${cleanTitle}-image`}
                className="object-cover w-full h-full rounded-2xl brightness-50"
              />
            </div>
          </div>
        )
      })}

      {/* Desktop Floating preview image - ONLY appears when row is hovered */}
      <div
        ref={previewRef}
        style={{ opacity: 0, transform: "scale(0.95)" }}
        className="fixed top-0 left-0 z-50 overflow-hidden border-2 border-black pointer-events-none w-[360px] h-[220px] rounded-2xl md:block hidden bg-zinc-950 shadow-2xl transition-opacity duration-200"
      >
        {currentIndex !== null && hackathons[currentIndex] && (
          <img
            src={
              hackathons[currentIndex].thumbnail_url ||
              "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1740&auto=format&fit=crop"
            }
            alt="preview"
            className="object-cover w-full h-full"
            onError={(e: any) => {
              e.target.src = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1740&auto=format&fit=crop"
            }}
          />
        )}
      </div>
    </div>
  )
}
