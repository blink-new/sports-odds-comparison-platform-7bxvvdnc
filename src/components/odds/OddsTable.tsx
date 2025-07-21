import { useState } from 'react'
import { BettingEvent, BettingOutcome, Bookmaker } from '../../types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Clock, Filter } from 'lucide-react'

interface OddsTableProps {
  events: BettingEvent[]
  bookmakers: Bookmaker[]
  userSubscription?: 'free' | 'advanced' | 'pro'
}

export function OddsTable({ events, bookmakers, userSubscription = 'free' }: OddsTableProps) {
  const [selectedSport, setSelectedSport] = useState<string>('all')
  const [selectedMarket, setSelectedMarket] = useState<string>('moneyline')

  // Filter events based on subscription
  const getAvailableEvents = () => {
    const limits = {
      free: 2,
      advanced: events.length,
      pro: events.length
    }
    return events.slice(0, limits[userSubscription])
  }

  // Filter bookmakers based on subscription
  const getAvailableBookmakers = () => {
    const limits = {
      free: 3,
      advanced: bookmakers.length,
      pro: bookmakers.length
    }
    return bookmakers.slice(0, limits[userSubscription])
  }

  const filteredEvents = getAvailableEvents().filter(event => 
    selectedSport === 'all' || event.sport === selectedSport
  )

  const availableBookmakers = getAvailableBookmakers()
  const sports = ['all', ...Array.from(new Set(events.map(e => e.sport)))]

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getOddsForBookmaker = (outcome: BettingOutcome, bookmakerId: string) => {
    return outcome.odds.find(odd => odd.bookmaker === bookmakerId)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Live Odds Comparison
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Sport" />
              </SelectTrigger>
              <SelectContent>
                {sports.map(sport => (
                  <SelectItem key={sport} value={sport}>
                    {sport === 'all' ? 'All Sports' : sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMarket} onValueChange={setSelectedMarket}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="moneyline">Moneyline</SelectItem>
                <SelectItem value="spread">Point Spread</SelectItem>
                <SelectItem value="total">Over/Under</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {userSubscription === 'free' && (
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Free plan: Limited to {getAvailableEvents().length} events and {availableBookmakers.length} bookmakers.{' '}
              <Button variant="link" className="p-0 h-auto text-primary">
                Upgrade for full access
              </Button>
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Event</TableHead>
                <TableHead className="min-w-[120px]">Time</TableHead>
                <TableHead className="min-w-[100px]">Market</TableHead>
                <TableHead className="min-w-[150px]">Outcome</TableHead>
                {availableBookmakers.map(bookmaker => (
                  <TableHead key={bookmaker.id} className="text-center min-w-[100px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl">{bookmaker.logo}</span>
                      <span className="text-xs font-medium">{bookmaker.name}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map(event => {
                const market = event.markets.find(m => m.type === selectedMarket)
                if (!market) return null

                return market.outcomes.map((outcome, outcomeIndex) => (
                  <TableRow key={`${event.id}-${outcome.id}`}>
                    {outcomeIndex === 0 && (
                      <>
                        <TableCell rowSpan={market.outcomes.length} className="font-medium">
                          <div>
                            <div className="font-semibold">{event.awayTeam} @ {event.homeTeam}</div>
                            <Badge variant="outline" className="mt-1">
                              {event.sport}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell rowSpan={market.outcomes.length}>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(event.eventTime)}
                          </div>
                        </TableCell>
                        <TableCell rowSpan={market.outcomes.length}>
                          <Badge variant="secondary">{market.name}</Badge>
                        </TableCell>
                      </>
                    )}
                    
                    <TableCell className="font-medium">
                      {outcome.name}
                    </TableCell>
                    
                    {availableBookmakers.map(bookmaker => {
                      const oddsData = getOddsForBookmaker(outcome, bookmaker.id)
                      return (
                        <TableCell key={bookmaker.id} className="text-center">
                          {oddsData ? (
                            <Button
                              variant={oddsData.isBest ? "default" : "outline"}
                              size="sm"
                              className={`min-w-[70px] ${
                                oddsData.isBest 
                                  ? 'bg-accent hover:bg-accent/90 text-accent-foreground' 
                                  : ''
                              }`}
                            >
                              {formatOdds(oddsData.odds)}
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              })}
            </TableBody>
          </Table>
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No events found for the selected filters.
          </div>
        )}
      </CardContent>
    </Card>
  )
}