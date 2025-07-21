import { BettingEvent, Bookmaker, BettingMarket, BettingOutcome, OddsData } from '../types'

// The Odds API - Best free sports betting API
// Free tier: 500 requests/month
// Documentation: https://the-odds-api.com/

interface OddsApiEvent {
  id: string
  sport_key: string
  sport_title: string
  commence_time: string
  home_team: string
  away_team: string
  bookmakers: OddsApiBookmaker[]
}

interface OddsApiBookmaker {
  key: string
  title: string
  last_update: string
  markets: OddsApiMarket[]
}

interface OddsApiMarket {
  key: string
  last_update: string
  outcomes: OddsApiOutcome[]
}

interface OddsApiOutcome {
  name: string
  price: number
  point?: number
}

interface ApiResponse {
  data: BettingEvent[]
  error?: string
  rateLimitRemaining?: number
  nextUpdate?: Date
}

class OddsApiService {
  private baseUrl = 'https://api.the-odds-api.com/v4'
  private apiKey: string | null = null
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private rateLimitRemaining = 500 // Free tier limit
  private lastRequestTime = 0
  private minRequestInterval = 2000 // 2 seconds between requests

  // Bookmaker mapping from API keys to our format
  private bookmakersMap: Record<string, Bookmaker> = {
    'draftkings': { id: 'draftkings', name: 'DraftKings', logo: '🏆' },
    'fanduel': { id: 'fanduel', name: 'FanDuel', logo: '🎯' },
    'betmgm': { id: 'betmgm', name: 'BetMGM', logo: '🦁' },
    'caesars': { id: 'caesars', name: 'Caesars', logo: '👑' },
    'pointsbet_us': { id: 'pointsbet', name: 'PointsBet', logo: '📊' },
    'barstool': { id: 'barstool', name: 'Barstool', logo: '🍺' },
    'betrivers': { id: 'betrivers', name: 'BetRivers', logo: '🌊' },
    'unibet_us': { id: 'unibet', name: 'Unibet', logo: '🎲' },
    'williamhill_us': { id: 'williamhill', name: 'William Hill', logo: '🏛️' },
    'bet365': { id: 'bet365', name: 'Bet365', logo: '🎰' }
  }

  // Sports mapping
  private sportsMap: Record<string, string> = {
    'americanfootball_nfl': 'NFL',
    'basketball_nba': 'NBA',
    'icehockey_nhl': 'NHL',
    'baseball_mlb': 'MLB',
    'soccer_epl': 'EPL',
    'soccer_uefa_champs_league': 'Champions League',
    'tennis_atp': 'ATP Tennis',
    'mma_mixed_martial_arts': 'MMA'
  }

  constructor() {
    // In production, this would come from environment variables
    // For demo, we'll use a placeholder and show how to integrate
    this.apiKey = null // Will be set via secrets management
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    // Rate limiting
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest))
    }

    // Check cache first
    const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`
    const cached = this.cache.get(cacheKey)
    if (cached && now - cached.timestamp < cached.ttl) {
      return cached.data
    }

    // If no API key, return demo data
    if (!this.apiKey) {
      console.warn('No API key configured. Using demo data. Set ODDS_API_KEY in secrets.')
      return this.getDemoData(endpoint)
    }

    try {
      const url = new URL(`${this.baseUrl}${endpoint}`)
      url.searchParams.set('apiKey', this.apiKey)
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })

      const response = await fetch(url.toString())
      
      // Update rate limit info
      const remaining = response.headers.get('x-requests-remaining')
      if (remaining) {
        this.rateLimitRemaining = parseInt(remaining)
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // Cache the response (5 minutes for odds data)
      this.cache.set(cacheKey, {
        data,
        timestamp: now,
        ttl: 5 * 60 * 1000 // 5 minutes
      })

      this.lastRequestTime = now
      return data

    } catch (error) {
      console.error('API request failed:', error)
      // Fallback to demo data on error
      return this.getDemoData(endpoint)
    }
  }

  private getDemoData(endpoint: string): any {
    // Return realistic demo data when API is not available
    if (endpoint.includes('/odds')) {
      return [
        {
          id: 'demo_nfl_1',
          sport_key: 'americanfootball_nfl',
          sport_title: 'NFL',
          commence_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          home_team: 'Kansas City Chiefs',
          away_team: 'Buffalo Bills',
          bookmakers: [
            {
              key: 'draftkings',
              title: 'DraftKings',
              last_update: new Date().toISOString(),
              markets: [
                {
                  key: 'h2h',
                  outcomes: [
                    { name: 'Kansas City Chiefs', price: 1.91 },
                    { name: 'Buffalo Bills', price: 1.91 }
                  ]
                }
              ]
            },
            {
              key: 'fanduel',
              title: 'FanDuel',
              last_update: new Date().toISOString(),
              markets: [
                {
                  key: 'h2h',
                  outcomes: [
                    { name: 'Kansas City Chiefs', price: 1.95 },
                    { name: 'Buffalo Bills', price: 1.87 }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
    return []
  }

  async getSports(): Promise<string[]> {
    try {
      const sports = await this.makeRequest('/sports', { all: 'false' })
      return sports.map((sport: any) => sport.key).filter((key: string) => this.sportsMap[key])
    } catch (error) {
      console.error('Failed to fetch sports:', error)
      return Object.keys(this.sportsMap)
    }
  }

  async getOdds(sport: string = 'americanfootball_nfl'): Promise<ApiResponse> {
    try {
      const params = {
        regions: 'us',
        markets: 'h2h,spreads,totals',
        oddsFormat: 'american',
        dateFormat: 'iso'
      }

      const events = await this.makeRequest(`/sports/${sport}/odds`, params)
      
      const transformedEvents = this.transformApiData(events)
      
      return {
        data: transformedEvents,
        rateLimitRemaining: this.rateLimitRemaining,
        nextUpdate: new Date(Date.now() + 5 * 60 * 1000) // Next update in 5 minutes
      }
    } catch (error) {
      console.error('Failed to fetch odds:', error)
      return {
        data: [],
        error: 'Failed to fetch odds data'
      }
    }
  }

  async getAllSportsOdds(): Promise<ApiResponse> {
    try {
      const sports = ['americanfootball_nfl', 'basketball_nba', 'icehockey_nhl']
      const allEvents: BettingEvent[] = []

      // Fetch odds for multiple sports (respecting rate limits)
      for (const sport of sports) {
        const response = await this.getOdds(sport)
        allEvents.push(...response.data)
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      return {
        data: allEvents,
        rateLimitRemaining: this.rateLimitRemaining,
        nextUpdate: new Date(Date.now() + 5 * 60 * 1000)
      }
    } catch (error) {
      console.error('Failed to fetch all sports odds:', error)
      return {
        data: [],
        error: 'Failed to fetch odds data'
      }
    }
  }

  private transformApiData(apiEvents: OddsApiEvent[]): BettingEvent[] {
    return apiEvents.map(event => this.transformEvent(event)).filter(Boolean) as BettingEvent[]
  }

  private transformEvent(apiEvent: OddsApiEvent): BettingEvent | null {
    try {
      const markets: BettingMarket[] = []
      
      // Group bookmakers by market type
      const marketData: Record<string, any> = {}
      
      apiEvent.bookmakers.forEach(bookmaker => {
        bookmaker.markets.forEach(market => {
          if (!marketData[market.key]) {
            marketData[market.key] = {
              outcomes: {},
              bookmakers: []
            }
          }
          
          market.outcomes.forEach(outcome => {
            if (!marketData[market.key].outcomes[outcome.name]) {
              marketData[market.key].outcomes[outcome.name] = []
            }
            
            const bookmakerInfo = this.bookmakersMap[bookmaker.key]
            if (bookmakerInfo) {
              marketData[market.key].outcomes[outcome.name].push({
                bookmaker: bookmakerInfo.id,
                odds: this.convertDecimalToAmerican(outcome.price),
                point: outcome.point
              })
            }
          })
        })
      })

      // Transform markets
      Object.entries(marketData).forEach(([marketKey, data]) => {
        const market = this.createMarket(marketKey, data, apiEvent)
        if (market) {
          markets.push(market)
        }
      })

      return {
        id: apiEvent.id,
        sport: this.sportsMap[apiEvent.sport_key] || apiEvent.sport_title,
        league: apiEvent.sport_title,
        homeTeam: apiEvent.home_team,
        awayTeam: apiEvent.away_team,
        eventTime: apiEvent.commence_time,
        markets
      }
    } catch (error) {
      console.error('Failed to transform event:', error)
      return null
    }
  }

  private createMarket(marketKey: string, data: any, apiEvent: OddsApiEvent): BettingMarket | null {
    const marketTypes: Record<string, { type: BettingMarket['type'], name: string }> = {
      'h2h': { type: 'moneyline', name: 'Moneyline' },
      'spreads': { type: 'spread', name: 'Point Spread' },
      'totals': { type: 'total', name: 'Over/Under' }
    }

    const marketInfo = marketTypes[marketKey]
    if (!marketInfo) return null

    const outcomes: BettingOutcome[] = []
    
    Object.entries(data.outcomes).forEach(([outcomeName, oddsArray]: [string, any]) => {
      // Find best odds for highlighting
      const oddsWithBest = this.markBestOdds(oddsArray as OddsData[])
      
      outcomes.push({
        id: `${marketKey}_${outcomeName.toLowerCase().replace(/\s+/g, '_')}`,
        name: outcomeName,
        odds: oddsWithBest
      })
    })

    return {
      id: marketKey,
      type: marketInfo.type,
      name: marketInfo.name,
      outcomes
    }
  }

  private markBestOdds(odds: OddsData[]): OddsData[] {
    if (odds.length === 0) return odds
    
    // Find best odds (highest for positive, closest to 0 for negative)
    let bestIndex = 0
    let bestValue = odds[0].odds
    
    odds.forEach((odd, index) => {
      if (odd.odds > 0 && bestValue > 0) {
        // Both positive, higher is better
        if (odd.odds > bestValue) {
          bestIndex = index
          bestValue = odd.odds
        }
      } else if (odd.odds < 0 && bestValue < 0) {
        // Both negative, closer to 0 is better
        if (odd.odds > bestValue) {
          bestIndex = index
          bestValue = odd.odds
        }
      } else if (odd.odds > 0 && bestValue < 0) {
        // Current is positive, previous negative - positive is better
        bestIndex = index
        bestValue = odd.odds
      }
      // If current is negative and previous positive, keep previous
    })
    
    return odds.map((odd, index) => ({
      ...odd,
      isBest: index === bestIndex
    }))
  }

  private convertDecimalToAmerican(decimal: number): number {
    if (decimal >= 2) {
      return Math.round((decimal - 1) * 100)
    } else {
      return Math.round(-100 / (decimal - 1))
    }
  }

  getRateLimitInfo() {
    return {
      remaining: this.rateLimitRemaining,
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // Resets daily
    }
  }

  getAvailableBookmakers(): Bookmaker[] {
    return Object.values(this.bookmakersMap)
  }
}

export const oddsApiService = new OddsApiService()
export default oddsApiService