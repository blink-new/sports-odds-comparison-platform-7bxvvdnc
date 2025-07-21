import { BettingEvent, Bookmaker, SubscriptionTier } from '../types'

export const bookmakers: Bookmaker[] = [
  { id: 'draftkings', name: 'DraftKings', logo: '🏆' },
  { id: 'fanduel', name: 'FanDuel', logo: '🎯' },
  { id: 'betmgm', name: 'BetMGM', logo: '🦁' },
  { id: 'caesars', name: 'Caesars', logo: '👑' },
  { id: 'pointsbet', name: 'PointsBet', logo: '📊' },
  { id: 'barstool', name: 'Barstool', logo: '🍺' }
]

export const mockEvents: BettingEvent[] = [
  {
    id: '1',
    sport: 'NFL',
    league: 'National Football League',
    homeTeam: 'Kansas City Chiefs',
    awayTeam: 'Buffalo Bills',
    eventTime: '2024-01-21T20:00:00Z',
    markets: [
      {
        id: 'moneyline',
        type: 'moneyline',
        name: 'Moneyline',
        outcomes: [
          {
            id: 'home',
            name: 'Kansas City Chiefs',
            odds: [
              { bookmaker: 'draftkings', odds: -110 },
              { bookmaker: 'fanduel', odds: -105, isBest: true },
              { bookmaker: 'betmgm', odds: -115 },
              { bookmaker: 'caesars', odds: -108 },
              { bookmaker: 'pointsbet', odds: -112 },
              { bookmaker: 'barstool', odds: -110 }
            ]
          },
          {
            id: 'away',
            name: 'Buffalo Bills',
            odds: [
              { bookmaker: 'draftkings', odds: -110 },
              { bookmaker: 'fanduel', odds: -115 },
              { bookmaker: 'betmgm', odds: -105, isBest: true },
              { bookmaker: 'caesars', odds: -112 },
              { bookmaker: 'pointsbet', odds: -108 },
              { bookmaker: 'barstool', odds: -110 }
            ]
          }
        ]
      },
      {
        id: 'spread',
        type: 'spread',
        name: 'Point Spread',
        outcomes: [
          {
            id: 'home_spread',
            name: 'Chiefs -2.5',
            odds: [
              { bookmaker: 'draftkings', odds: -110 },
              { bookmaker: 'fanduel', odds: -108, isBest: true },
              { bookmaker: 'betmgm', odds: -115 },
              { bookmaker: 'caesars', odds: -110 },
              { bookmaker: 'pointsbet', odds: -112 },
              { bookmaker: 'barstool', odds: -110 }
            ]
          },
          {
            id: 'away_spread',
            name: 'Bills +2.5',
            odds: [
              { bookmaker: 'draftkings', odds: -110 },
              { bookmaker: 'fanduel', odds: -112 },
              { bookmaker: 'betmgm', odds: -105, isBest: true },
              { bookmaker: 'caesars', odds: -110 },
              { bookmaker: 'pointsbet', odds: -108 },
              { bookmaker: 'barstool', odds: -110 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: '2',
    sport: 'NBA',
    league: 'National Basketball Association',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Boston Celtics',
    eventTime: '2024-01-21T22:00:00Z',
    markets: [
      {
        id: 'moneyline',
        type: 'moneyline',
        name: 'Moneyline',
        outcomes: [
          {
            id: 'home',
            name: 'Los Angeles Lakers',
            odds: [
              { bookmaker: 'draftkings', odds: +120 },
              { bookmaker: 'fanduel', odds: +125, isBest: true },
              { bookmaker: 'betmgm', odds: +118 },
              { bookmaker: 'caesars', odds: +122 },
              { bookmaker: 'pointsbet', odds: +115 },
              { bookmaker: 'barstool', odds: +120 }
            ]
          },
          {
            id: 'away',
            name: 'Boston Celtics',
            odds: [
              { bookmaker: 'draftkings', odds: -140 },
              { bookmaker: 'fanduel', odds: -145 },
              { bookmaker: 'betmgm', odds: -135, isBest: true },
              { bookmaker: 'caesars', odds: -142 },
              { bookmaker: 'pointsbet', odds: -138 },
              { bookmaker: 'barstool', odds: -140 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: '3',
    sport: 'NHL',
    league: 'National Hockey League',
    homeTeam: 'Toronto Maple Leafs',
    awayTeam: 'Montreal Canadiens',
    eventTime: '2024-01-21T19:00:00Z',
    markets: [
      {
        id: 'moneyline',
        type: 'moneyline',
        name: 'Moneyline',
        outcomes: [
          {
            id: 'home',
            name: 'Toronto Maple Leafs',
            odds: [
              { bookmaker: 'draftkings', odds: -180 },
              { bookmaker: 'fanduel', odds: -175, isBest: true },
              { bookmaker: 'betmgm', odds: -185 },
              { bookmaker: 'caesars', odds: -178 },
              { bookmaker: 'pointsbet', odds: -182 },
              { bookmaker: 'barstool', odds: -180 }
            ]
          },
          {
            id: 'away',
            name: 'Montreal Canadiens',
            odds: [
              { bookmaker: 'draftkings', odds: +150 },
              { bookmaker: 'fanduel', odds: +145 },
              { bookmaker: 'betmgm', odds: +155, isBest: true },
              { bookmaker: 'caesars', odds: +148 },
              { bookmaker: 'pointsbet', odds: +152 },
              { bookmaker: 'barstool', odds: +150 }
            ]
          }
        ]
      }
    ]
  }
]

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Basic odds comparison',
      '3 sports leagues',
      'Limited bookmakers',
      'Standard support'
    ],
    maxSports: 3,
    hasAlerts: false,
    hasAnalytics: false,
    hasApi: false
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price: 29,
    features: [
      'All odds comparison',
      '10+ sports leagues',
      'All bookmakers',
      'Real-time alerts',
      'Priority support'
    ],
    maxSports: 10,
    hasAlerts: true,
    hasAnalytics: false,
    hasApi: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    features: [
      'Everything in Advanced',
      'Unlimited sports',
      'Advanced analytics',
      'API access',
      'Historical data',
      'Custom alerts'
    ],
    maxSports: -1,
    hasAlerts: true,
    hasAnalytics: true,
    hasApi: true
  }
]