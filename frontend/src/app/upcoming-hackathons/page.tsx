"use client"

import { useState, useMemo } from "react"
import { HackathonGrid } from "@/components/hackathons/hackathon-grid"
import { useHackathons } from "@/hooks/use-hackathons"
import FloatingNav from "@/components/ui/FloatingNav"
import { Search, LayoutGrid, LayoutList, Trophy, Globe, MapPin, Clock, ArrowUpDown, Filter, Sparkles } from "lucide-react"

function parsePrizeValue(prizeText?: string): number {
  if (!prizeText) return 0
  const cleaned = prizeText.replace(/,/g, "")
  const match = cleaned.match(/(\d[\d.]*)/)
  if (!match) return 0
  let val = parseFloat(match[1])
  if (cleaned.toLowerCase().includes("k")) val *= 1000
  if (cleaned.toLowerCase().includes("m") || cleaned.toLowerCase().includes("million")) val *= 1000000
  return val
}

export default function UpcomingHackathonsPage() {
  const { hackathons, isLoading, error } = useHackathons()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [sortBy, setSortBy] = useState<"default" | "prize" | "closingSoon" | "title">("default")
  const [locationFilter, setLocationFilter] = useState<"all" | "online" | "in-person">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "open">("all")

  const processedHackathons = useMemo(() => {
    if (!hackathons) return []

    let result = hackathons

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((h) => {
        const titleMatch = h.title?.toLowerCase().includes(q)
        const orgMatch = h.organization_name?.toLowerCase().includes(q)
        const themeMatch = h.themes?.some((theme: any) =>
          (theme.name || theme).toString().toLowerCase().includes(q)
        )
        return titleMatch || orgMatch || themeMatch
      })
    }

    // Location filter
    if (locationFilter === "online") {
      result = result.filter((h) => {
        const loc = (h.displayed_location || "").toLowerCase()
        return loc.includes("online") || loc.includes("virtual") || !loc
      })
    } else if (locationFilter === "in-person") {
      result = result.filter((h) => {
        const loc = (h.displayed_location || "").toLowerCase()
        return loc && !loc.includes("online") && !loc.includes("virtual")
      })
    }

    // Status filter
    if (statusFilter === "open") {
      result = result.filter((h) => h.isOpen === "open")
    }

    // Sorting
    if (sortBy === "prize") {
      result = [...result].sort((a, b) => parsePrizeValue(b.prizeText) - parsePrizeValue(a.prizeText))
    } else if (sortBy === "title") {
      result = [...result].sort((a, b) => (a.title || "").localeCompare(b.title || ""))
    } else if (sortBy === "closingSoon") {
      result = [...result].sort((a, b) => {
        const aOpen = a.isOpen === "open" ? 0 : 1
        const bOpen = b.isOpen === "open" ? 0 : 1
        return aOpen - bOpen
      })
    }

    return result
  }, [hackathons, searchQuery, locationFilter, statusFilter, sortBy])

  return (
    <div className="min-h-screen bg-[#EBEBEB] text-black font-sans selection:bg-black selection:text-white pb-20">
      {/* Floating Header Nav */}
      <FloatingNav />

      {/* Top Navbar / Header */}
      <header className="flex justify-between items-start px-6 pt-32 md:px-12 md:pt-40">
        <h1 className="text-[12vw] leading-[0.8] font-medium tracking-tighter uppercase m-0 p-0">
          HACKATHONS
        </h1>
      </header>

      {/* Divider */}
      <div className="w-full h-[1px] bg-black/30 mt-6 md:mt-12" />

      {/* Description & Main Controls Bar */}
      <div className="px-6 py-8 md:px-12 md:py-12 space-y-8">
        <div className="flex flex-col-reverse lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Search Input */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-black/50" />
            <input
              type="text"
              placeholder="Search hackathons, hosts, tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/5 border border-black/20 rounded-full py-3.5 pl-12 pr-6 text-black placeholder:text-black/50 focus:outline-none focus:border-black/50 focus:bg-black/10 transition-colors text-sm md:text-base"
            />
          </div>

          {/* View Mode Toggle Buttons (List View vs Show Details / Grid) */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur border border-black/15 p-1.5 rounded-full shadow-sm">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-wider ${
                viewMode === "list"
                  ? "bg-black text-white shadow"
                  : "text-black/70 hover:text-black hover:bg-black/5"
              }`}
            >
              <LayoutList className="size-4" />
              <span>List View</span>
            </button>

            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-wider ${
                viewMode === "grid"
                  ? "bg-black text-white shadow"
                  : "text-black/70 hover:text-black hover:bg-black/5"
              }`}
            >
              <LayoutGrid className="size-4" />
              <span>Show Details</span>
            </button>
          </div>
        </div>

        {/* Detailed Grid Controls (Visible when "Show Details" is active or always available for filtering) */}
        {viewMode === "grid" && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/60 border border-black/10 backdrop-blur-sm">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Location Filter */}
              <div className="flex items-center gap-1 bg-black/5 border border-black/10 p-1 rounded-full text-xs">
                <button
                  onClick={() => setLocationFilter("all")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    locationFilter === "all" ? "bg-black text-white" : "text-black/70 hover:text-black"
                  }`}
                >
                  All Locations
                </button>
                <button
                  onClick={() => setLocationFilter("online")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                    locationFilter === "online" ? "bg-black text-white" : "text-black/70 hover:text-black"
                  }`}
                >
                  <Globe className="size-3" />
                  <span>Online</span>
                </button>
                <button
                  onClick={() => setLocationFilter("in-person")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                    locationFilter === "in-person" ? "bg-black text-white" : "text-black/70 hover:text-black"
                  }`}
                >
                  <MapPin className="size-3" />
                  <span>In-Person</span>
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-black/5 border border-black/10 p-1 rounded-full text-xs">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    statusFilter === "all" ? "bg-black text-white" : "text-black/70 hover:text-black"
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setStatusFilter("open")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    statusFilter === "open" ? "bg-emerald-700 text-white" : "text-black/70 hover:text-black"
                  }`}
                >
                  Open Only
                </button>
              </div>
            </div>

            {/* Sorting & Counter */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-black/60">
                {processedHackathons.length} {processedHackathons.length === 1 ? "Hackathon" : "Hackathons"}
              </span>

              <div className="flex items-center gap-2 bg-black/5 border border-black/10 px-3 py-1.5 rounded-xl text-xs">
                <ArrowUpDown className="size-3.5 text-black/60" />
                <span className="font-bold text-black/70 uppercase">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-transparent font-semibold text-black focus:outline-none cursor-pointer"
                >
                  <option value="default">Featured</option>
                  <option value="prize">Highest Prize Pool</option>
                  <option value="closingSoon">Closing Soon</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid / List View */}
      <main className="w-full">
        <HackathonGrid
          hackathons={processedHackathons}
          isLoading={isLoading}
          error={error}
          viewMode={viewMode}
        />
      </main>
    </div>
  )
}
