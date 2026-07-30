"use client"

import { X, SlidersHorizontal, Sparkles, RotateCcw, Calendar, DollarSign, Tag, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { FilterState } from "@/types/hackathons"
import { motion, AnimatePresence } from "framer-motion"

interface FiltersPanelProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  isOpen: boolean
  onClose: () => void
  availableThemes: string[]
}

const THEME_OPTIONS = [
  "Beginner Friendly",
  "AI/ML",
  "Social Good",
  "Web Development",
  "Mobile",
  "Blockchain",
  "Hardware",
  "Gaming",
  "Healthcare",
  "Education",
]

export function FiltersPanel({ filters, onFiltersChange, isOpen, onClose, availableThemes }: FiltersPanelProps) {
  const toggleTheme = (theme: string) => {
    const newThemes = filters.themes.includes(theme)
      ? filters.themes.filter((t) => t !== theme)
      : [...filters.themes, theme]
    onFiltersChange({ ...filters, themes: newThemes })
  }

  const resetFilters = () => {
    onFiltersChange({
      search: filters.search,
      themes: [],
      location: "",
      minPrize: undefined,
      maxPrize: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: "endingSoon",
    })
  }

  const themesToShow = availableThemes.length > 0 ? availableThemes : THEME_OPTIONS
  const activeFilterCount =
    filters.themes.length +
    (filters.minPrize ? 1 : 0) +
    (filters.maxPrize ? 1 : 0) +
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-md lg:hidden"
          />

          {/* Panel Container */}
          <motion.aside
            initial={{ x: -340 }}
            animate={{ x: 0 }}
            exit={{ x: -340 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed left-0 top-0 z-50 h-screen w-88 overflow-y-auto border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 p-6 backdrop-blur-2xl shadow-2xl lg:sticky lg:top-28 lg:h-[calc(100vh-8rem)] lg:w-80 lg:rounded-3xl lg:border lg:shadow-lg lg:z-10"
          >
            {/* Panel Header */}
            <div className="mb-6 flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <SlidersHorizontal className="size-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Filters</h2>
                  <p className="text-xs text-zinc-500">Refine hackathons search</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold px-2 py-0.5">
                    {activeFilterCount} active
                  </Badge>
                )}
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl lg:hidden">
                  <X className="size-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Themes Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="size-4 text-indigo-500" />
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Themes & Tags</Label>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {themesToShow.map((theme) => {
                    const isSelected = filters.themes.includes(theme)
                    return (
                      <Badge
                        key={theme}
                        variant={isSelected ? "default" : "outline"}
                        className={`cursor-pointer transition-all duration-200 text-xs py-1 px-3 rounded-xl font-medium ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-zinc-700 dark:text-zinc-300"
                        }`}
                        onClick={() => toggleTheme(theme)}
                      >
                        {theme}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              {/* Prize Range Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="size-4 text-emerald-500" />
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Prize Pool ($)</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min ($)"
                    value={filters.minPrize || ""}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        minPrize: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 text-sm focus-visible:ring-indigo-500"
                  />
                  <Input
                    type="number"
                    placeholder="Max ($)"
                    value={filters.maxPrize || ""}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        maxPrize: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 text-sm focus-visible:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-sky-500" />
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Date Window</Label>
                </div>
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={filters.startDate || ""}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, startDate: e.target.value || undefined })
                    }
                    className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 text-sm focus-visible:ring-indigo-500"
                  />
                  <Input
                    type="date"
                    value={filters.endDate || ""}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, endDate: e.target.value || undefined })
                    }
                    className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 text-sm focus-visible:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="size-4 text-purple-500" />
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Sort By</Label>
                </div>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: "latest" | "prize" | "popular" | "endingSoon") =>
                    onFiltersChange({ ...filters, sortBy: value })
                  }
                >
                  <SelectTrigger className="w-full rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xl">
                    <SelectItem value="endingSoon" className="rounded-xl">Ending Soon</SelectItem>
                    <SelectItem value="prize" className="rounded-xl">Highest Prize Pool</SelectItem>
                    <SelectItem value="popular" className="rounded-xl">Most Popular</SelectItem>
                    <SelectItem value="latest" className="rounded-xl">Recently Added</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Button */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-500 transition-all gap-2"
                  onClick={resetFilters}
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reset All Filters</span>
                </Button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
