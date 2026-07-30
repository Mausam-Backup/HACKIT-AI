export interface Theme {
  id: number
  name: string
}

export interface Hackathon {
  _id: string
  id: number
  url: string
  title: string
  thumbnail_url: string
  featured: boolean
  organization_name: string
  isOpen: "open" | "closed"
  submission_period_dates: string
  displayed_location: string
  registrations_count: number
  prizeText: string
  time_left_to_submission: string
  themes: Theme[]
  start_a_submission_url: string
  source: string
  description?: string
  submission_start?: string
  submission_end?: string
}

export interface HackathonResponse {
  last_updated: string
  count: number
  hackathons: Hackathon[]
}

export interface FilterState {
  search: string
  themes: string[]
  location: string
  minPrize: number | undefined
  maxPrize: number | undefined
  startDate: string | undefined
  endDate: string | undefined
  sortBy: "latest" | "prize" | "popular" | "endingSoon"
}
