"use client"

import { useState, useMemo } from "react"
import FloatingNav from "@/components/ui/FloatingNav"
import Footer from "@/components/landing/Footer"
import {
  RESOURCES_DATA,
  type Resource,
} from "@/components/resources/resources-data"
import {
  Search,
  Sparkles,
  Trophy,
  Layout,
  Presentation,
  Zap,
  ExternalLink,
  BookOpen,
  Video,
  Mic,
  Wrench,
  Globe,
  X,
  Play,
  PlayCircle,
  Code2,
  Building2,
  ArrowUpRight,
  Plus,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeVideo, setActiveVideo] = useState<Resource | null>(null)

  // Category Tabs metadata
  const CATEGORY_TABS = [
    { id: "all", label: "All Resources", count: RESOURCES_DATA.length },
    { id: "interviews", label: "Winner Breakdowns", icon: Trophy, count: RESOURCES_DATA.filter((r) => r.category === "interviews").length },
    { id: "vibe-coding", label: "Vibe-Coding", icon: Code2, count: RESOURCES_DATA.filter((r) => r.category === "vibe-coding").length },
    { id: "ui-components", label: "UI Libraries", icon: Layout, count: RESOURCES_DATA.filter((r) => r.category === "ui-components").length },
    { id: "ai-backend", label: "AI & Backend", icon: Zap, count: RESOURCES_DATA.filter((r) => r.category === "ai-tools" || r.category === "backend-deploy").length },
    { id: "big-tech", label: "Big Tech Guides", icon: Building2, count: RESOURCES_DATA.filter((r) => r.category === "big-tech").length },
    { id: "pitch-strategy", label: "Pitching & Strategy", icon: Presentation, count: RESOURCES_DATA.filter((r) => r.category === "pitch-prep" || r.category === "beginner-mindset").length },
  ]

  // Filter resources based on search query
  const filteredResources = useMemo(() => {
    if (!searchQuery) return RESOURCES_DATA
    const q = searchQuery.toLowerCase()
    return RESOURCES_DATA.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        (item.authorOrSource && item.authorOrSource.toLowerCase().includes(q))
    )
  }, [searchQuery])

  // Group items by refined categories
  const interviewItems = useMemo(() => filteredResources.filter((r) => r.category === "interviews"), [filteredResources])
  const vibeCodingItems = useMemo(() => filteredResources.filter((r) => r.category === "vibe-coding"), [filteredResources])
  const uiItems = useMemo(() => filteredResources.filter((r) => r.category === "ui-components"), [filteredResources])
  const aiBackendItems = useMemo(() => filteredResources.filter((r) => r.category === "ai-tools" || r.category === "backend-deploy"), [filteredResources])
  const bigTechItems = useMemo(() => filteredResources.filter((r) => r.category === "big-tech"), [filteredResources])
  const pitchStrategyItems = useMemo(() => filteredResources.filter((r) => r.category === "pitch-prep" || r.category === "beginner-mindset"), [filteredResources])

  const getTypeIcon = (type: Resource["type"]) => {
    switch (type) {
      case "Video":
        return <Video className="size-3.5 text-rose-400" />
      case "Podcast":
        return <Mic className="size-3.5 text-purple-400" />
      case "Website":
        return <Globe className="size-3.5 text-sky-400" />
      case "Tool":
        return <Wrench className="size-3.5 text-amber-400" />
      case "Guide":
        return <BookOpen className="size-3.5 text-emerald-400" />
      default:
        return <Sparkles className="size-3.5 text-indigo-400" />
    }
  }

  const getYouTubeId = (url?: string): string | null => {
    if (!url) return null
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
    return match ? match[1] : null
  }

  const renderResourceCard = (resource: Resource, index: number, isBento: boolean = true) => {
    const isLarge = isBento && (index === 0 || resource.featured)
    const ytId = resource.type === "Video" ? (resource.youtubeId || getYouTubeId(resource.url)) : null
    const youtubeEmbedUrl = resource.youtubeEmbedUrl || (ytId ? `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1` : undefined)
    const activeVideoTarget: Resource | null = ytId ? { ...resource, youtubeId: ytId, youtubeEmbedUrl } : null

    return (
      <motion.div
        key={resource.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className={`group relative h-full flex ${isLarge ? "md:col-span-2" : ""}`}
      >
        <Card className="h-full flex flex-col justify-between overflow-hidden rounded-[2rem] border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-lg transition-all group relative">
          {/* Circular Top Right Action Button */}
          <div className="absolute top-4 right-4 z-20">
            {activeVideoTarget ? (
              <button
                onClick={() => setActiveVideo(activeVideoTarget)}
                className="size-10 rounded-full bg-white/90 backdrop-blur border border-zinc-200 flex items-center justify-center text-zinc-900 hover:bg-rose-600 hover:text-white transition-all shadow-md group-hover:scale-105"
                title="Play Video"
              >
                <Play className="size-4 fill-current ml-0.5" />
              </button>
            ) : (
              <button
                onClick={() => window.open(resource.url, "_blank")}
                className="size-10 rounded-full bg-white/90 backdrop-blur border border-zinc-200 flex items-center justify-center text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all shadow-md group-hover:scale-105"
                title="Open Link"
              >
                <ArrowUpRight className="size-4" />
              </button>
            )}
          </div>

          {/* Image / Video Thumbnail (ONLY for YouTube videos) */}
          {ytId && (
            <div
              onClick={() => activeVideoTarget && setActiveVideo(activeVideoTarget)}
              className={`relative w-full bg-zinc-950 overflow-hidden cursor-pointer group/vid ${isLarge ? "h-64 sm:h-80 shrink-0" : "h-48 shrink-0"}`}
            >
              <Image
                src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                alt={resource.title}
                fill
                unoptimized
                className="object-cover transition-transform duration-700 group-hover/vid:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent group-hover/vid:from-zinc-950/60 transition-colors" />

              {/* Central Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-12 sm:size-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl group-hover/vid:scale-110 group-hover/vid:bg-rose-600 transition-all duration-300 backdrop-blur-sm border border-white/20">
                  <Play className="size-5 sm:size-6 fill-current ml-0.5" />
                </div>
              </div>

              <Badge className="absolute top-4 left-4 bg-white/90 text-zinc-900 border-zinc-200 text-[10px] font-bold tracking-widest uppercase shadow-sm z-10">
                {resource.type}
              </Badge>
            </div>
          )}

          <div className={`p-6 sm:p-8 pt-6 sm:pt-8 shrink-0 ${!ytId ? "pr-14 sm:pr-16" : ""}`}>
            {/* Badge & Type Header */}
            <div className="flex items-center gap-3 mb-5">
              {resource.badge && (
                <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 border border-zinc-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  {resource.badge}
                </Badge>
              )}
              {!ytId && (
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  {getTypeIcon(resource.type)}
                  <span>{resource.type}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className={`${isLarge ? "text-3xl sm:text-4xl" : "text-xl"} font-serif tracking-tight text-zinc-900 group-hover:text-zinc-600 transition-colors mb-4 leading-[1.1]`}>
              {resource.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed mb-8 font-medium">
              {resource.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              {resource.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block text-[10px] font-bold tracking-widest uppercase text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-6 sm:px-8 sm:pb-8 pt-4 border-t border-zinc-100/50 flex items-center justify-between mt-auto">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate max-w-[200px]">
              {resource.authorOrSource || "Verified Resource"}
            </span>
          </div>
        </Card>
      </motion.div>
    )
  }

  const renderGapFiller = (items: Resource[], sectionId: string) => {
    let L = 0
    let S = 0
    items.forEach((r, idx) => {
      if (idx === 0 || r.featured) L++
      else S++
    })

    const totalCols = 2 * L + S
    const gapMd = (2 - (totalCols % 2)) % 2
    const gapLg = (3 - (totalCols % 3)) % 3

    if (gapMd === 0 && gapLg === 0) return null

    let responsiveClasses = "hidden "
    if (gapMd === 1) responsiveClasses += "md:flex md:col-span-1 "
    else responsiveClasses += "md:hidden "

    if (gapLg === 1) responsiveClasses += "lg:flex lg:col-span-1 "
    else if (gapLg === 2) responsiveClasses += "lg:flex lg:col-span-2 "
    else responsiveClasses += "lg:hidden "

    return (
      <div
        key={`filler-${sectionId}`}
        onClick={() => window.open("https://github.com/Mausam5055/SCOF", "_blank")}
        className={`group relative h-full flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-200/80 rounded-[2rem] bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300 transition-colors cursor-pointer min-h-[300px] ${responsiveClasses}`}
      >
        <div className="size-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Plus className="size-5 text-zinc-400" />
        </div>
        <h3 className="text-xl font-serif text-zinc-600 mb-2 text-center">Have a resource?</h3>
        <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 text-center">Submit to the community</p>
      </div>
    )
  }

  const renderSection = (
    id: string,
    title: string,
    subtitle: string,
    items: Resource[],
    icon?: React.ReactNode
  ) => {
    if (items.length === 0) return null

    return (
      <section id={id} className="space-y-8 scroll-mt-32 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {icon}
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? "Resource" : "Resources"}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-zinc-900 tracking-tight leading-none">
              {title}
            </h2>
          </div>
          <p className="text-xs font-bold text-zinc-400 tracking-widest uppercase max-w-md">
            {subtitle}
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(0,auto)] grid-flow-row-dense">
          {items.map((item, idx) => renderResourceCard(item, idx))}
          {renderGapFiller(items, id)}
        </div>
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-amber-500 selection:text-zinc-900 pt-32">
      {/* Floating Header Nav */}
      <FloatingNav />

      {/* Main Multi-Section Layout */}
      <div className="container mx-auto px-4 pb-12 max-w-7xl space-y-12">
        {/* Search Bar & Category Filter Pills */}
        <div className="mx-auto max-w-3xl w-full space-y-6">
          <div className="relative flex items-center">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search guides, tools, UI libraries, case studies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-10 h-14 rounded-2xl border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 shadow-md focus-visible:ring-2 focus-visible:ring-amber-500 transition-all text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Category Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
            {CATEGORY_TABS.map((tab) => {
              const isActive = selectedCategory === tab.id
              const Icon = tab.icon

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 shadow-sm border ${
                    isActive
                      ? "bg-zinc-900 text-white border-zinc-900 shadow"
                      : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  {Icon && <Icon className="size-3.5" />}
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Categorized Bento Grids */}
        {(selectedCategory === "all" || selectedCategory === "interviews") &&
          renderSection(
            "sec-interviews",
            "Winner Breakdowns",
            "Watch SIH, Anthropic, and global hackathon winners break down their winning code",
            interviewItems,
            <Trophy className="size-4 text-amber-500" />
          )}

        {(selectedCategory === "all" || selectedCategory === "vibe-coding") &&
          renderSection(
            "sec-vibe-coding",
            "Vibe-Coding & AI Workflows",
            "Master Cursor AI workflows, rapid refactoring, and full-stack prototyping",
            vibeCodingItems,
            <Code2 className="size-4 text-rose-500" />
          )}

        {(selectedCategory === "all" || selectedCategory === "ui-components") &&
          renderSection(
            "sec-ui-components",
            "Speed-Building UI Libraries",
            "Copy-paste component registries like 21st.dev, shadcn/ui, Magic UI, Aceternity UI",
            uiItems,
            <Layout className="size-4 text-sky-500" />
          )}

        {(selectedCategory === "all" || selectedCategory === "ai-backend") &&
          renderSection(
            "sec-ai-backend",
            "AI Infrastructure & Databases",
            "Instant Postgres with Supabase, real-time sync, and zero-latency LLM inference with Groq",
            aiBackendItems,
            <Zap className="size-4 text-amber-500" />
          )}

        {(selectedCategory === "all" || selectedCategory === "big-tech") &&
          renderSection(
            "sec-big-tech",
            "Big Tech Guides & Frameworks",
            "Official toolkits from GitHub, Devpost, Google Cloud, and Microsoft",
            bigTechItems,
            <Building2 className="size-4 text-emerald-500" />
          )}

        {(selectedCategory === "all" || selectedCategory === "pitch-strategy") &&
          renderSection(
            "sec-pitch-strategy",
            "Pitching & Deck Strategy",
            "5-slide pitch method, judge scoring criteria, deck design, and hacker blueprints",
            pitchStrategyItems,
            <Presentation className="size-4 text-purple-500" />
          )}
      </div>

      {/* Interactive YouTube Video Player Modal */}
      <AnimatePresence>
        {activeVideo && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideo(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:px-6 border-b border-zinc-200 bg-zinc-50/80">
                <div className="flex items-center gap-2">
                  <PlayCircle className="size-5 text-rose-500" />
                  <span className="font-bold text-sm text-zinc-900 truncate max-w-md">
                    {activeVideo.title}
                  </span>
                </div>

                <button
                  onClick={() => setActiveVideo(null)}
                  className="size-8 rounded-full bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 flex items-center justify-center transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* YouTube iFrame Player */}
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={activeVideo.youtubeEmbedUrl}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              {/* Video Info Footer */}
              <div className="p-4 sm:p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-zinc-600 leading-relaxed max-w-2xl mb-2">
                    {activeVideo.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>Source: {activeVideo.authorOrSource}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 text-xs gap-1.5 shrink-0"
                  onClick={() => window.open(activeVideo.url, "_blank")}
                >
                  <span>Open on YouTube</span>
                  <ExternalLink className="size-3.5" />
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </div>
  )
}
