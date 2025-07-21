export interface Bookmaker {
  id: string
  name: string
  logo: string
}

export interface OddsData {
  bookmaker: string
  odds: number
  isBest?: boolean
}

export interface BettingEvent {
  id: string
  sport: string
  league: string
  homeTeam: string
  awayTeam: string
  eventTime: string
  markets: BettingMarket[]
}

export interface BettingMarket {
  id: string
  type: 'moneyline' | 'spread' | 'total'
  name: string
  outcomes: BettingOutcome[]
}

export interface BettingOutcome {
  id: string
  name: string
  odds: OddsData[]
}

export interface SubscriptionTier {
  id: string
  name: string
  price: number
  features: string[]
  maxSports: number
  hasAlerts: boolean
  hasAnalytics: boolean
  hasApi: boolean
}

export interface User {
  id: string
  email: string
  subscription: 'free' | 'advanced' | 'pro'
}