import { useState, useEffect, useCallback, useRef } from 'react'
import { BettingEvent, Bookmaker } from '../types'
import combinedOddsService from '../services/combinedOddsService'

interface UseCombinedOddsReturn {
  events: BettingEvent[]
  bookmakers: Bookmaker[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  nextUpdate: Date | null
  rateLimitRemaining: number
  sources: string[]
  refreshData: () => Promise<void>
  isRealTime: boolean
  testSources: () => Promise<any>
}

interface UseCombinedOddsOptions {
  sport?: string
  autoRefresh?: boolean
  refreshInterval?: number
  maxRetries?: number
}

export function useCombinedOdds(options: UseCombinedOddsOptions = {}): UseCombinedOddsReturn {
  const {
    sport,
    autoRefresh = true,
    refreshInterval = 2 * 60 * 1000, // 2 minutes for combined data
    maxRetries = 3
  } = options

  const [events, setEvents] = useState<BettingEvent[]>([])
  const [bookmakers, setBookmakers] = useState<Bookmaker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null)
  const [rateLimitRemaining, setRateLimitRemaining] = useState(500)
  const [sources, setSources] = useState<string[]>([])
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
      console.log(`Fetching combined odds data${sport ? ` for ${sport}` : ''}...`)
      
      const response = sport 
        ? await combinedOddsService.getOddsBySport(sport)
        : await combinedOddsService.getAllOdds()

      if (response.error) {
        console.warn('Combined odds service warning:', response.error)
        setError(response.error)
      }

      setEvents(response.data)
      setBookmakers(combinedOddsService.getAllBookmakers())
      setLastUpdated(response.lastUpdated)
      setNextUpdate(response.nextUpdate)
      setRateLimitRemaining(response.rateLimitRemaining || 0)
      setSources(response.sources)
      setIsRealTime(response.data.length > 0 && response.sources.length > 0)
      
      // Reset retry count on success
      retryCountRef.current = 0
      
      console.log(`Successfully fetched ${response.data.length} events from sources:`, response.sources)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch combined odds data'
      
      // Only set error if we've exhausted retries
      if (retryCountRef.current >= maxRetries) {
        setError(errorMessage)
        setIsRealTime(false)
        retryCountRef.current = 0
        console.error('All retry attempts failed:', errorMessage)
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
  }, [sport, maxRetries])

  const refreshData = useCallback(async () => {
    console.log('Manual refresh triggered')
    await fetchData(true)
  }, [fetchData])

  const testSources = useCallback(async () => {
    console.log('Testing individual data sources...')
    try {
      const results = await combinedOddsService.testSources()
      console.log('Source test results:', results)
      return results
    } catch (error) {
      console.error('Failed to test sources:', error)
      return { error: 'Failed to test sources' }
    }
  }, [])

  // Setup auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const setupInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      intervalRef.current = setInterval(() => {
        // Always refresh for combined data (Sportsbet doesn't have rate limits)
        console.log('Auto-refresh triggered')
        fetchData(false)
      }, refreshInterval)
    }

    setupInterval()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoRefresh, refreshInterval, fetchData])

  // Initial data fetch
  useEffect(() => {
    console.log('Initial data fetch triggered')
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
        console.log('Tab hidden, pausing auto-refresh')
      } else {
        // Resume updates when tab becomes visible
        if (autoRefresh) {
          console.log('Tab visible, resuming auto-refresh')
          fetchData(false) // Refresh immediately
          
          // Restart interval
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
          intervalRef.current = setInterval(() => {
            fetchData(false)
          }, refreshInterval)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [autoRefresh, refreshInterval, fetchData])

  return {
    events,
    bookmakers,
    loading,
    error,
    lastUpdated,
    nextUpdate,
    rateLimitRemaining,
    sources,
    refreshData,
    isRealTime,
    testSources
  }
}