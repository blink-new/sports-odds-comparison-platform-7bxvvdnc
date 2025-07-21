import { useState, useEffect, useCallback, useRef } from 'react'
import { BettingEvent, Bookmaker } from '../types'
import oddsApiService from '../services/oddsApi'

interface UseOddsDataReturn {
  events: BettingEvent[]
  bookmakers: Bookmaker[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  nextUpdate: Date | null
  rateLimitRemaining: number
  refreshData: () => Promise<void>
  isRealTime: boolean
}

interface UseOddsDataOptions {
  sport?: string
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
  maxRetries?: number
}

export function useOddsData(options: UseOddsDataOptions = {}): UseOddsDataReturn {
  const {
    sport,
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 minutes default
    maxRetries = 3
  } = options

  const [events, setEvents] = useState<BettingEvent[]>([])
  const [bookmakers, setBookmakers] = useState<Bookmaker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null)
  const [rateLimitRemaining, setRateLimitRemaining] = useState(500)
  const [isRealTime, setIsRealTime] = useState(false)

  const retryCountRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async (showLoading = true) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    
    if (showLoading) {
      setLoading(true)
    }
    setError(null)

    try {
      const response = sport 
        ? await oddsApiService.getOdds(sport)
        : await oddsApiService.getAllSportsOdds()

      if (response.error) {
        throw new Error(response.error)
      }

      setEvents(response.data)
      setBookmakers(oddsApiService.getAvailableBookmakers())
      setLastUpdated(new Date())
      setNextUpdate(response.nextUpdate || new Date(Date.now() + refreshInterval))
      setRateLimitRemaining(response.rateLimitRemaining || 0)
      setIsRealTime(response.data.length > 0)
      
      // Reset retry count on success
      retryCountRef.current = 0
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch odds data'
      
      // Only set error if we've exhausted retries
      if (retryCountRef.current >= maxRetries) {
        setError(errorMessage)
        setIsRealTime(false)
        retryCountRef.current = 0
      } else {
        retryCountRef.current++
        console.warn(`Fetch attempt ${retryCountRef.current} failed, retrying...`, errorMessage)
        
        // Exponential backoff for retries
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 10000)
        setTimeout(() => fetchData(false), retryDelay)
        return
      }
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }, [sport, refreshInterval, maxRetries])

  const refreshData = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  // Setup auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const setupInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      intervalRef.current = setInterval(() => {
        // Only refresh if we have rate limit remaining
        if (rateLimitRemaining > 10) {
          fetchData(false)
        } else {
          console.warn('Rate limit low, skipping auto-refresh')
        }
      }, refreshInterval)
    }

    setupInterval()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoRefresh, refreshInterval, rateLimitRemaining, fetchData])

  // Initial data fetch
  useEffect(() => {
    fetchData(true)

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Page visibility API - pause/resume updates when tab is hidden/visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause updates when tab is hidden
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      } else {
        // Resume updates when tab becomes visible
        if (autoRefresh) {
          fetchData(false) // Refresh immediately
          
          // Restart interval
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
          intervalRef.current = setInterval(() => {
            if (rateLimitRemaining > 10) {
              fetchData(false)
            }
          }, refreshInterval)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [autoRefresh, refreshInterval, rateLimitRemaining, fetchData])

  return {
    events,
    bookmakers,
    loading,
    error,
    lastUpdated,
    nextUpdate,
    rateLimitRemaining,
    refreshData,
    isRealTime
  }
}