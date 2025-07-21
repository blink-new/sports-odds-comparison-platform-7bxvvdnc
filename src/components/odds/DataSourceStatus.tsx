import React from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { RefreshCw, Database, Globe, TestTube } from 'lucide-react'

interface DataSourceStatusProps {
  sources: string[]
  lastUpdated: Date | null
  nextUpdate: Date | null
  rateLimitRemaining: number
  isRealTime: boolean
  onRefresh: () => void
  onTestSources: () => Promise<any>
  loading: boolean
  error: string | null
}

export function DataSourceStatus({
  sources,
  lastUpdated,
  nextUpdate,
  rateLimitRemaining,
  isRealTime,
  onRefresh,
  onTestSources,
  loading,
  error
}: DataSourceStatusProps) {
  const [testing, setTesting] = React.useState(false)
  const [testResults, setTestResults] = React.useState<any>(null)

  const handleTestSources = async () => {
    setTesting(true)
    try {
      const results = await onTestSources()
      setTestResults(results)
      console.log('Test results:', results)
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setTesting(false)
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'the odds api':
        return '🏆'
      case 'sportsbet':
        return '🇦🇺'
      case 'demo data':
        return '🎭'
      default:
        return '📊'
    }
  }

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'the odds api':
        return 'bg-blue-100 text-blue-800'
      case 'sportsbet':
        return 'bg-green-100 text-green-800'
      case 'demo data':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never'
    return date.toLocaleTimeString()
  }

  const getTimeUntilNext = () => {
    if (!nextUpdate) return 'Unknown'
    const now = new Date()
    const diff = nextUpdate.getTime() - now.getTime()
    if (diff <= 0) return 'Now'
    
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Sources
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestSources}
              disabled={testing}
              className="text-xs"
            >
              <TestTube className="h-3 w-3 mr-1" />
              {testing ? 'Testing...' : 'Test'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Sources */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Active Sources ({sources.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {sources.length > 0 ? (
              sources.map((source, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={`${getSourceColor(source)} text-xs`}
                >
                  <span className="mr-1">{getSourceIcon(source)}</span>
                  {source}
                </Badge>
              ))
            ) : (
              <Badge variant="destructive" className="text-xs">
                No active sources
              </Badge>
            )}
          </div>
        </div>

        {/* Status Information */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-gray-500 mb-1">Status</div>
            <div className={`font-medium ${isRealTime ? 'text-green-600' : 'text-yellow-600'}`}>
              {isRealTime ? '🟢 Live' : '🟡 Demo'}
            </div>
          </div>
          
          <div>
            <div className="text-gray-500 mb-1">Last Updated</div>
            <div className="font-medium">{formatTime(lastUpdated)}</div>
          </div>
          
          <div>
            <div className="text-gray-500 mb-1">Next Update</div>
            <div className="font-medium">{getTimeUntilNext()}</div>
          </div>
          
          <div>
            <div className="text-gray-500 mb-1">API Limit</div>
            <div className={`font-medium ${rateLimitRemaining < 50 ? 'text-red-600' : 'text-green-600'}`}>
              {rateLimitRemaining} left
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="text-yellow-800 text-xs">
              <strong>Warning:</strong> {error}
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResults && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <h5 className="text-xs font-medium mb-2">Source Test Results:</h5>
            <div className="space-y-2 text-xs">
              <div>
                <strong>The Odds API:</strong>{' '}
                <span className={testResults.oddsApi?.error ? 'text-red-600' : 'text-green-600'}>
                  {testResults.oddsApi?.error ? '❌ Failed' : '✅ Working'}
                </span>
                {testResults.oddsApi?.data?.length && (
                  <span className="text-gray-600 ml-2">
                    ({testResults.oddsApi.data.length} events)
                  </span>
                )}
              </div>
              <div>
                <strong>Sportsbet Scraper:</strong>{' '}
                <span className={testResults.sportsbet?.error ? 'text-red-600' : 'text-green-600'}>
                  {testResults.sportsbet?.error ? '❌ Failed' : '✅ Working'}
                </span>
                {testResults.sportsbet?.extractedEvents?.length && (
                  <span className="text-gray-600 ml-2">
                    ({testResults.sportsbet.extractedEvents.length} events)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="text-blue-800 text-xs">
            <strong>💡 Data Sources:</strong>
            <ul className="mt-1 space-y-1 ml-4">
              <li>• <strong>The Odds API:</strong> US bookmakers (DraftKings, FanDuel, etc.)</li>
              <li>• <strong>Sportsbet:</strong> Australian odds via web scraping</li>
              <li>• <strong>Demo Data:</strong> Fallback when APIs are unavailable</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}