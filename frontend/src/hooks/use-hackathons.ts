import useSWR from 'swr'
import { useEffect, useState } from 'react'
import type { Hackathon, HackathonResponse } from '@/types/hackathons'

const LOCAL_FALLBACK_URL = '/all_hackathons.json'
const EXTERNAL_FALLBACK_URL = 'https://WebDevHarsha.github.io/open-hackathons-api/data.json'

async function fetcherWithFallback(primaryUrl: string): Promise<HackathonResponse> {
  const urlsToTry = Array.from(
    new Set([primaryUrl, LOCAL_FALLBACK_URL, EXTERNAL_FALLBACK_URL].filter(Boolean))
  )

  let lastError: Error | null = null

  for (const url of urlsToTry) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)

      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} when fetching ${url}`)
      }

      const json = await res.json()

      let hackathonsList: Hackathon[] = []
      let count = 0
      let lastUpdated = ''

      if (Array.isArray(json)) {
        hackathonsList = json
        count = json.length
      } else if (json && typeof json === 'object') {
        hackathonsList = Array.isArray(json.hackathons) ? json.hackathons : []
        count = typeof json.count === 'number' ? json.count : hackathonsList.length
        lastUpdated = json.last_updated || ''
      }

      if (hackathonsList.length > 0) {
        return {
          hackathons: hackathonsList,
          count,
          last_updated: lastUpdated,
        }
      }
    } catch (err: any) {
      console.warn(`[useHackathons] Failed to fetch hackathons from ${url}:`, err?.message || err)
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  throw lastError || new Error('Failed to load hackathons from all available sources')
}

export function useHackathons() {
  const apiUrl = process.env.NEXT_PUBLIC_HACKATHONS_API_URL || LOCAL_FALLBACK_URL

  const { data, error, isLoading } = useSWR<HackathonResponse>(
    apiUrl,
    fetcherWithFallback,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  const [hackathons, setHackathons] = useState<Hackathon[]>(data?.hackathons || [])
  const [count, setCount] = useState<number>(data?.count || 0)
  const [lastUpdated, setLastUpdated] = useState<string>(data?.last_updated || '')

  useEffect(() => {
    if (data) {
      setHackathons(data.hackathons || [])
      setCount(data.count || 0)
      setLastUpdated(data.last_updated || '')
    }
  }, [data])

  return {
    hackathons,
    count,
    lastUpdated,
    isLoading,
    error,
  }
}

