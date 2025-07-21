import { useState, useEffect } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  Zap
} from 'lucide-react'

interface RealTimeStatusProps {
  isRealTime: boolean
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  nextUpdate: Date | null
  rateLimitRemaining: number
  onRefresh: () => void
}

export function RealTimeStatus({
  isRealTime,
  loading,
  error,
  lastUpdated,
  nextUpdate,
  rateLimitRemaining,
  onRefresh
}: RealTimeStatusProps) {
  const [timeUntilUpdate, setTimeUntilUpdate] = useState<string>('')

  useEffect(() => {
    if (!nextUpdate) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = nextUpdate.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeUntilUpdate('Updating...')
      } else {
        const minutes = Math.floor(diff / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        setTimeUntilUpdate(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [nextUpdate])

  const getStatusColor = () => {
    if (error) return 'destructive'
    if (loading) return 'secondary'
    if (isRealTime) return 'default'
    return 'outline'
  }

  const getStatusIcon = () => {
    if (error) return <WifiOff className="h-3 w-3" />
    if (loading) return <RefreshCw className="h-3 w-3 animate-spin" />
    if (isRealTime) return <Wifi className="h-3 w-3" />
    return <WifiOff className="h-3 w-3" />
  }

  const getStatusText = () => {
    if (error) return 'Connection Error'
    if (loading) return 'Updating...'
    if (isRealTime) return 'Live Data'
    return 'Demo Mode'
  }

  const getRateLimitColor = () => {
    if (rateLimitRemaining > 100) return 'default'
    if (rateLimitRemaining > 50) return 'secondary'
    if (rateLimitRemaining > 10) return 'destructive'
    return 'destructive'
  }

  const getRateLimitIcon = () => {
    if (rateLimitRemaining > 100) return <CheckCircle className="h-3 w-3" />
    if (rateLimitRemaining > 10) return <AlertTriangle className="h-3 w-3" />
    return <Zap className="h-3 w-3" />
  }

  return (
    <Card className="border-muted">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Status Section */}
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant={getStatusColor()} className="flex items-center gap-1">
                    {getStatusIcon()}
                    {getStatusText()}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    {error ? (
                      <div>
                        <p className="font-medium text-destructive">Connection Error</p>
                        <p className="text-muted-foreground">{error}</p>
                        <p className="text-xs mt-1">Using demo data</p>
                      </div>
                    ) : isRealTime ? (
                      <div>
                        <p className="font-medium text-green-600">Live Connection Active</p>
                        <p className="text-muted-foreground">Real-time odds from The Odds API</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">Demo Mode</p>
                        <p className="text-muted-foreground">Add ODDS_API_KEY for live data</p>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Rate Limit Status */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant={getRateLimitColor()} className="flex items-center gap-1">
                    {getRateLimitIcon()}
                    {rateLimitRemaining} requests
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-medium">API Rate Limit</p>
                    <p className="text-muted-foreground">
                      {rateLimitRemaining} of 500 requests remaining
                    </p>
                    <p className="text-xs mt-1">Resets daily at midnight UTC</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Update Info Section */}
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Activity className="h-3 w-3" />
                <span>
                  Updated {lastUpdated.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
            )}

            {nextUpdate && !loading && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Next: {timeUntilUpdate}</span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading || rateLimitRemaining <= 0}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* API Setup Notice */}
        {!isRealTime && !error && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Demo Mode Active</p>
                <p className="text-muted-foreground mt-1">
                  To get live odds data, add your free API key from{' '}
                  <a 
                    href="https://the-odds-api.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    The Odds API
                  </a>
                  {' '}to your project secrets as <code className="bg-muted px-1 rounded">ODDS_API_KEY</code>.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Free tier includes 500 requests/month • Perfect for testing and small projects
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rate Limit Warning */}
        {rateLimitRemaining <= 10 && rateLimitRemaining > 0 && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Low Rate Limit</p>
                <p className="text-muted-foreground mt-1">
                  Only {rateLimitRemaining} API requests remaining. Auto-refresh will pause to preserve quota.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}