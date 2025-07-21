import { BettingEvent, Bookmaker, BettingMarket, BettingOutcome, OddsData } from '../types'
import oddsApiService from './oddsApi'
import sportsbetScraper from './sportsbetScraper'

interface CombinedApiResponse {
  data: BettingEvent[]
  error?: string
  lastUpdated: Date
  nextUpdate: Date
  sources: string[]
  rateLimitRemaining?: number
}

interface DataSource {
  name: string
  enabled: boolean
  priority: number
  bookmakers: string[]
}

class CombinedOddsService {
  private dataSources: DataSource[] = [
    {
      name: 'The Odds API',
      enabled: true,
      priority: 1,
      bookmakers: ['draftkings', 'fanduel', 'betmgm', 'caesars', 'bet365']
    },
    {
      name: 'Sportsbet Scraper',
      enabled: true,
      priority: 2,
      bookmakers: ['sportsbet']
    }
  ]

  private cache = new Map<string, { data: BettingEvent[]; timestamp: number; ttl: number }>()

  constructor() {
    console.log('Combined odds service initialized with sources:', this.dataSources.map(s => s.name))
  }

  async getAllOdds(): Promise<CombinedApiResponse> {
    const sources: string[] = []
    const allEvents: BettingEvent[] = []
    let rateLimitRemaining: number | undefined
    let hasError = false
    let errorMessage = ''

    try {
      // Fetch from The Odds API
      if (this.isSourceEnabled('The Odds API')) {
        try {
          console.log('Fetching from The Odds API...')
          const oddsApiResponse = await oddsApiService.getAllSportsOdds()
          
          if (oddsApiResponse.data.length > 0) {
            allEvents.push(...oddsApiResponse.data)
            sources.push('The Odds API')
            rateLimitRemaining = oddsApiResponse.rateLimitRemaining
          }
          
          if (oddsApiResponse.error) {
            console.warn('The Odds API error:', oddsApiResponse.error)
          }
        } catch (error) {
          console.error('The Odds API failed:', error)
          hasError = true
          errorMessage += 'The Odds API failed. '
        }
      }

      // Fetch from Sportsbet scraper
      if (this.isSourceEnabled('Sportsbet Scraper')) {
        try {
          console.log('Fetching from Sportsbet scraper...')
          const sportsbetResponse = await sportsbetScraper.scrapeAllSports()
          
          if (sportsbetResponse.data.length > 0) {
            // Merge Sportsbet data with existing events or add as new events
            const mergedEvents = this.mergeEventData(allEvents, sportsbetResponse.data)
            allEvents.length = 0 // Clear array
            allEvents.push(...mergedEvents)
            
            if (!sources.includes('Sportsbet')) {
              sources.push('Sportsbet')
            }
          }
          
          if (sportsbetResponse.error) {
            console.warn('Sportsbet scraper error:', sportsbetResponse.error)
          }
        } catch (error) {
          console.error('Sportsbet scraper failed:', error)
          hasError = true
          errorMessage += 'Sportsbet scraper failed. '
        }
      }

      // If no data from any source, return demo data
      if (allEvents.length === 0) {
        console.log('No data from any source, using demo data')
        allEvents.push(...this.getDemoData())
        sources.push('Demo Data')
      }

      return {
        data: allEvents,
        error: hasError ? errorMessage.trim() : undefined,
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
        sources,
        rateLimitRemaining
      }

    } catch (error) {
      console.error('Combined odds service error:', error)
      return {
        data: this.getDemoData(),
        error: 'Failed to fetch odds from all sources',
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 2 * 60 * 1000),
        sources: ['Demo Data']
      }
    }
  }

  async getOddsBySport(sport: string): Promise<CombinedApiResponse> {
    const sources: string[] = []
    const allEvents: BettingEvent[] = []
    let rateLimitRemaining: number | undefined

    try {
      // Map sport names for different services
      const sportMapping: Record<string, { oddsApi: string; sportsbet: string }> = {
        'afl': { oddsApi: 'aussierules_afl', sportsbet: 'afl' },
        'nrl': { oddsApi: 'rugbyleague_nrl', sportsbet: 'nrl' },
        'nba': { oddsApi: 'basketball_nba', sportsbet: 'nba' },
        'nfl': { oddsApi: 'americanfootball_nfl', sportsbet: 'nfl' },
        'soccer': { oddsApi: 'soccer_epl', sportsbet: 'soccer' }
      }

      const mapping = sportMapping[sport.toLowerCase()]
      
      if (!mapping) {
        throw new Error(`Unsupported sport: ${sport}`)
      }

      // Fetch from The Odds API
      if (this.isSourceEnabled('The Odds API') && mapping.oddsApi) {
        try {
          const oddsApiResponse = await oddsApiService.getOdds(mapping.oddsApi)
          
          if (oddsApiResponse.data.length > 0) {
            allEvents.push(...oddsApiResponse.data)
            sources.push('The Odds API')
            rateLimitRemaining = oddsApiResponse.rateLimitRemaining
          }
        } catch (error) {
          console.error(`The Odds API failed for ${sport}:`, error)
        }
      }

      // Fetch from Sportsbet scraper
      if (this.isSourceEnabled('Sportsbet Scraper') && mapping.sportsbet) {
        try {
          let sportsbetResponse
          
          switch (mapping.sportsbet) {
            case 'afl':
              sportsbetResponse = await sportsbetScraper.scrapeAFL()
              break
            case 'nrl':
              sportsbetResponse = await sportsbetScraper.scrapeNRL()
              break
            case 'nba':
              sportsbetResponse = await sportsbetScraper.scrapeNBA()
              break
            default:
              throw new Error(`Sportsbet scraping not implemented for ${mapping.sportsbet}`)
          }
          
          if (sportsbetResponse.data.length > 0) {
            const mergedEvents = this.mergeEventData(allEvents, sportsbetResponse.data)
            allEvents.length = 0
            allEvents.push(...mergedEvents)
            
            if (!sources.includes('Sportsbet')) {
              sources.push('Sportsbet')
            }
          }
        } catch (error) {
          console.error(`Sportsbet scraper failed for ${sport}:`, error)
        }
      }

      return {
        data: allEvents,
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 2 * 60 * 1000),
        sources,
        rateLimitRemaining
      }

    } catch (error) {
      console.error(`Failed to fetch odds for ${sport}:`, error)
      return {
        data: [],
        error: `Failed to fetch ${sport} odds`,
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 2 * 60 * 1000),
        sources: []
      }
    }
  }

  private mergeEventData(existingEvents: BettingEvent[], newEvents: BettingEvent[]): BettingEvent[] {
    const mergedEvents: BettingEvent[] = [...existingEvents]
    
    for (const newEvent of newEvents) {
      // Try to find a matching event by teams and sport
      const existingEventIndex = mergedEvents.findIndex(existing => 
        this.eventsMatch(existing, newEvent)
      )
      
      if (existingEventIndex >= 0) {
        // Merge odds data for the same event
        const existingEvent = mergedEvents[existingEventIndex]
        mergedEvents[existingEventIndex] = this.mergeEventOdds(existingEvent, newEvent)
      } else {
        // Add as new event
        mergedEvents.push(newEvent)
      }
    }
    
    return mergedEvents
  }

  private eventsMatch(event1: BettingEvent, event2: BettingEvent): boolean {
    // Normalize team names for comparison
    const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    const event1Home = normalize(event1.homeTeam)
    const event1Away = normalize(event1.awayTeam)
    const event2Home = normalize(event2.homeTeam)
    const event2Away = normalize(event2.awayTeam)
    
    // Check if teams match (in either order) and sport matches
    const teamsMatch = (
      (event1Home === event2Home && event1Away === event2Away) ||
      (event1Home === event2Away && event1Away === event2Home)
    )
    
    const sportMatch = normalize(event1.sport) === normalize(event2.sport)
    
    return teamsMatch && sportMatch
  }

  private mergeEventOdds(event1: BettingEvent, event2: BettingEvent): BettingEvent {
    const mergedMarkets: BettingMarket[] = [...event1.markets]
    
    for (const market2 of event2.markets) {
      const existingMarketIndex = mergedMarkets.findIndex(m => 
        m.type === market2.type || m.name === market2.name
      )
      
      if (existingMarketIndex >= 0) {
        // Merge outcomes for the same market
        const existingMarket = mergedMarkets[existingMarketIndex]
        mergedMarkets[existingMarketIndex] = this.mergeMarketOdds(existingMarket, market2)
      } else {
        // Add new market
        mergedMarkets.push(market2)
      }
    }
    
    return {
      ...event1,
      markets: mergedMarkets
    }
  }

  private mergeMarketOdds(market1: BettingMarket, market2: BettingMarket): BettingMarket {
    const mergedOutcomes: BettingOutcome[] = [...market1.outcomes]
    
    for (const outcome2 of market2.outcomes) {
      const existingOutcomeIndex = mergedOutcomes.findIndex(o => 
        this.outcomeNamesMatch(o.name, outcome2.name)
      )
      
      if (existingOutcomeIndex >= 0) {
        // Merge odds for the same outcome
        const existingOutcome = mergedOutcomes[existingOutcomeIndex]
        mergedOutcomes[existingOutcomeIndex] = {
          ...existingOutcome,
          odds: [...existingOutcome.odds, ...outcome2.odds]
        }
      } else {
        // Add new outcome
        mergedOutcomes.push(outcome2)
      }
    }
    
    // Recalculate best odds after merging
    mergedOutcomes.forEach(outcome => {
      outcome.odds = this.markBestOdds(outcome.odds)
    })
    
    return {
      ...market1,
      outcomes: mergedOutcomes
    }
  }

  private outcomeNamesMatch(name1: string, name2: string): boolean {
    const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '')
    return normalize(name1) === normalize(name2)
  }

  private markBestOdds(odds: OddsData[]): OddsData[] {
    if (odds.length === 0) return odds
    
    // Find best odds (highest for positive, closest to 0 for negative)
    let bestIndex = 0
    let bestValue = odds[0].odds
    
    odds.forEach((odd, index) => {
      if (odd.odds > 0 && bestValue > 0) {
        if (odd.odds > bestValue) {
          bestIndex = index
          bestValue = odd.odds
        }
      } else if (odd.odds < 0 && bestValue < 0) {
        if (odd.odds > bestValue) {
          bestIndex = index
          bestValue = odd.odds
        }
      } else if (odd.odds > 0 && bestValue < 0) {
        bestIndex = index
        bestValue = odd.odds
      }
    })
    
    return odds.map((odd, index) => ({
      ...odd,
      isBest: index === bestIndex
    }))
  }

  private isSourceEnabled(sourceName: string): boolean {
    const source = this.dataSources.find(s => s.name === sourceName)
    return source?.enabled ?? false
  }

  private getDemoData(): BettingEvent[] {
    return [
      {
        id: 'demo_combined_1',
        sport: 'AFL',
        league: 'Australian Football League',
        homeTeam: 'Richmond Tigers',
        awayTeam: 'Collingwood Magpies',
        eventTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        markets: [{
          id: 'demo_h2h',
          type: 'moneyline',
          name: 'Head to Head',
          outcomes: [
            {
              id: 'richmond',
              name: 'Richmond Tigers',
              odds: [
                { bookmaker: 'sportsbet', odds: -115, isBest: true },
                { bookmaker: 'bet365', odds: -120, isBest: false }
              ]
            },
            {
              id: 'collingwood',
              name: 'Collingwood Magpies',
              odds: [
                { bookmaker: 'sportsbet', odds: -105, isBest: false },
                { bookmaker: 'bet365', odds: -100, isBest: true }
              ]
            }
          ]
        }]
      }
    ]
  }

  getAllBookmakers(): Bookmaker[] {
    return [
      ...oddsApiService.getAvailableBookmakers(),
      sportsbetScraper.getBookmaker()
    ]
  }

  getDataSources(): DataSource[] {
    return this.dataSources
  }

  enableSource(sourceName: string): void {
    const source = this.dataSources.find(s => s.name === sourceName)
    if (source) {
      source.enabled = true
    }
  }

  disableSource(sourceName: string): void {
    const source = this.dataSources.find(s => s.name === sourceName)
    if (source) {
      source.enabled = false
    }
  }

  // Test method to check individual sources
  async testSources(): Promise<any> {
    const results = {
      oddsApi: null as any,
      sportsbet: null as any
    }

    try {
      results.oddsApi = await oddsApiService.getAllSportsOdds()
    } catch (error) {
      results.oddsApi = { error: error instanceof Error ? error.message : 'Unknown error' }
    }

    try {
      results.sportsbet = await sportsbetScraper.testScrape('afl')
    } catch (error) {
      results.sportsbet = { error: error instanceof Error ? error.message : 'Unknown error' }
    }

    return results
  }
}

export const combinedOddsService = new CombinedOddsService()
export default combinedOddsService