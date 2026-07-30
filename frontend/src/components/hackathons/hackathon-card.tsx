"use client"

import { motion } from "framer-motion"
import { Calendar, MapPin, Trophy, Users, Clock, ExternalLink, Star, Globe } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Hackathon } from "@/types/hackathons"
import Image from "next/image"

interface HackathonCardProps {
  hackathon: Hackathon
  index: number
}

export function cleanHtml(input?: string): string {
  if (!input) return ""
  return input
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim()
}

function getPlatformInfo(url: string, source?: string) {
  const u = (url || "").toLowerCase()
  const s = (source || "").toLowerCase()
  if (u.includes("devpost.com") || s.includes("devpost")) return { name: "Devpost", bg: "bg-teal-700 text-white" }
  if (u.includes("unstop.com") || s.includes("unstop")) return { name: "Unstop", bg: "bg-blue-700 text-white" }
  if (u.includes("hack2skill.com") || s.includes("hack2skill")) return { name: "Hack2Skill", bg: "bg-orange-700 text-white" }
  if (u.includes("mlh.io") || s.includes("mlh")) return { name: "MLH", bg: "bg-red-700 text-white" }
  if (u.includes("taikai.network") || s.includes("taikai")) return { name: "Taikai", bg: "bg-indigo-700 text-white" }
  return { name: "Platform", bg: "bg-zinc-900 text-white" }
}

export function HackathonCard({ hackathon, index }: HackathonCardProps) {
  const parseDates = (dateString: string) => {
    let start = new Date()
    let end = new Date()

    try {
      if (dateString && dateString.includes(" - ")) {
        const parts = dateString.split(", ")
        const year = parts.length > 1 ? parts[1] : new Date().getFullYear().toString()
        const dateRange = parts[0].split(" - ")

        const startMonthDay = dateRange[0]
        const endDay = dateRange[1]

        const parsedStart = new Date(`${startMonthDay}, ${year}`)
        if (!isNaN(parsedStart.getTime())) {
          start = parsedStart
        }

        const endMonth = start.getMonth()
        const parsedEnd = new Date(start.getFullYear(), endMonth, parseInt(endDay), 23, 59, 59)
        if (!isNaN(parsedEnd.getTime())) {
          end = parsedEnd
        }
      } else if (dateString) {
        const singleDate = new Date(dateString)
        if (!isNaN(singleDate.getTime())) {
          start = singleDate
          end = singleDate
        }
      }
    } catch (error) {
      console.error("Error parsing dates:", error)
    }
    return { start, end }
  }

  const cleanTitle = cleanHtml(hackathon.title) || "Hackathon Event"
  const cleanOrg = cleanHtml(hackathon.organization_name) || "Official Host"
  const cleanLocation = cleanHtml(hackathon.displayed_location) || "Online"
  const cleanPrizeText = cleanHtml(hackathon.prizeText)
  const cleanDates = cleanHtml(hackathon.submission_period_dates)
  const cleanTimeLeft = cleanHtml(hackathon.time_left_to_submission)

  const { start: startDate, end: endDate } =
    typeof hackathon.submission_period_dates === "string"
      ? parseDates(hackathon.submission_period_dates)
      : { start: new Date(), end: new Date() }

  const formatDate = (date: Date | null | undefined) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return ""
    }
    return date.toISOString().replace(/[-:]|\.\d{3}/g, "")
  }

  const startFormatted = formatDate(startDate)
  const endFormatted = formatDate(endDate)

  const titleEnc = encodeURIComponent(cleanTitle)
  const locationEnc = encodeURIComponent(cleanLocation)
  const descriptionEnc = encodeURIComponent(cleanHtml(hackathon.description) || "Participate in this hackathon!")

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleEnc}&dates=${startFormatted}/${endFormatted}&location=${locationEnc}&details=${descriptionEnc}`
  const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${titleEnc}&startdt=${startFormatted}&enddt=${endFormatted}&location=${locationEnc}&body=${descriptionEnc}`
  const icalContent = encodeURIComponent(
    `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${hackathon._id}@open-hackathons\nDTSTAMP:${formatDate(
      new Date()
    )}\nDTSTART:${startFormatted}\nDTEND:${endFormatted}\nSUMMARY:${cleanTitle}\nLOCATION:${cleanLocation}\nDESCRIPTION:${cleanHtml(
      hackathon.description
    )}\nEND:VEVENT\nEND:VCALENDAR`
  )
  const icalCalendarUrl = `data:text/calendar;charset=utf-8,${icalContent}`

  const platform = getPlatformInfo(hackathon.url, hackathon.source)
  const isOnline =
    cleanLocation.toLowerCase().includes("online") ||
    cleanLocation.toLowerCase().includes("virtual") ||
    !cleanLocation

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      whileHover={{ y: -6 }}
      className="group h-full flex flex-col"
    >
      <Card className="relative h-full flex flex-col justify-between overflow-hidden rounded-[2rem] border border-black/15 bg-white text-zinc-900 shadow-sm hover:shadow-2xl hover:border-black/40 transition-all duration-300">
        {/* Top Image Banner */}
        <div className="relative h-48 w-full overflow-hidden bg-zinc-100 shrink-0">
          {hackathon.thumbnail_url ? (
            <Image
              src={hackathon.thumbnail_url || "/placeholder.svg"}
              alt={cleanTitle}
              fill
              unoptimized
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-100">
              <Trophy className="size-14 text-zinc-400" />
            </div>
          )}

          {/* Dark Overlay Gradient for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />

          {/* Badges Container */}
          <div className="absolute inset-x-3 top-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-md ${platform.bg}`}>
                {platform.name}
              </span>
              {hackathon.featured && (
                <Badge className="bg-amber-500 text-zinc-950 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md uppercase">
                  <Star className="size-3 fill-current" />
                  Featured
                </Badge>
              )}
            </div>

            <Badge
              variant="outline"
              className={`backdrop-blur-md font-bold text-[10px] px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 shadow-sm uppercase ${
                hackathon.isOpen === "open"
                  ? "bg-emerald-600 text-white border-emerald-400/40"
                  : "bg-zinc-900/90 text-zinc-300 border-zinc-700"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  hackathon.isOpen === "open" ? "bg-white animate-pulse" : "bg-zinc-400"
                }`}
              />
              {hackathon.isOpen === "open" ? "Open" : "Closed"}
            </Badge>
          </div>

          {/* Host / Organization Name Pill */}
          <div className="absolute bottom-3 left-4 right-4 z-10">
            <p className="text-xs font-bold text-white tracking-wide uppercase truncate drop-shadow-md">
              {cleanOrg}
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="mb-3 line-clamp-2 text-lg font-serif font-medium tracking-tight leading-snug text-zinc-900 group-hover:text-zinc-600 transition-colors">
              {cleanTitle}
            </h3>

            {/* Prize & Urgency Badges */}
            <div className="space-y-2 mb-4">
              {cleanPrizeText ? (
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full text-xs w-fit">
                  <Trophy className="size-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{cleanPrizeText}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-zinc-500 font-medium bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full text-xs w-fit">
                  <Trophy className="size-3.5 text-zinc-400 shrink-0" />
                  <span>Prize pool TBA</span>
                </div>
              )}

              {cleanTimeLeft && hackathon.isOpen === "open" && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200/80 px-3 py-1.5 text-xs font-semibold text-rose-700 w-fit">
                  <Clock className="size-3.5 shrink-0 animate-pulse text-rose-600" />
                  <span className="truncate">{cleanTimeLeft}</span>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 pt-1">
              <div className="flex items-center gap-1.5 truncate">
                {isOnline ? (
                  <Globe className="size-3.5 text-sky-600 shrink-0" />
                ) : (
                  <MapPin className="size-3.5 text-amber-600 shrink-0" />
                )}
                <span className="truncate font-medium">
                  {cleanLocation}
                </span>
              </div>

              {cleanDates && (
                <div className="flex items-center gap-1.5 truncate">
                  <Calendar className="size-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{cleanDates}</span>
                </div>
              )}

              {hackathon.registrations_count !== null && hackathon.registrations_count > 0 ? (
                <div className="flex items-center gap-1.5 truncate col-span-2">
                  <Users className="size-3.5 text-indigo-600 shrink-0" />
                  <span className="font-medium">{hackathon.registrations_count.toLocaleString()} hackers registered</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Themes / Tags */}
          {hackathon.themes && hackathon.themes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {hackathon.themes.slice(0, 3).map((theme: any, i: number) => {
                const themeName = typeof theme === "string" ? theme : theme?.name || ""
                const themeKey = typeof theme === "object" && theme?.id ? theme.id : `${themeName}-${i}`
                return (
                  <span
                    key={themeKey}
                    className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200"
                  >
                    {cleanHtml(themeName)}
                  </span>
                )
              })}
              {hackathon.themes.length > 3 && (
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-400">
                  +{hackathon.themes.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Action & Calendar Section */}
          <div className="pt-2 space-y-2 border-t border-zinc-100">
            <Button
              className="w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs py-3 flex items-center justify-center gap-2 transition-all shadow-md"
              onClick={(e) => {
                e.preventDefault()
                if (hackathon.url) {
                  window.open(hackathon.url, "_blank")
                }
              }}
            >
              <span>View & Apply</span>
              <ExternalLink className="size-3.5" />
            </Button>

            <div className="grid grid-cols-3 gap-1 pt-1">
              <button
                type="button"
                onClick={() => window.open(googleCalendarUrl, "_blank")}
                className="rounded-lg text-[10px] font-bold uppercase tracking-wider py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors text-center"
              >
                + Google
              </button>
              <button
                type="button"
                onClick={() => window.open(outlookCalendarUrl, "_blank")}
                className="rounded-lg text-[10px] font-bold uppercase tracking-wider py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors text-center"
              >
                + Outlook
              </button>
              <button
                type="button"
                onClick={() => window.open(icalCalendarUrl, "_blank")}
                className="rounded-lg text-[10px] font-bold uppercase tracking-wider py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors text-center"
              >
                + iCal
              </button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
