import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HeroSection } from './components/hero/HeroSection'
import { OddsTable } from './components/odds/OddsTable'
import { RealTimeStatus } from './components/odds/RealTimeStatus'
import { FeaturesSection } from './components/features/FeaturesSection'
import { PricingSection } from './components/pricing/PricingSection'
import { useOddsData } from './hooks/useOddsData'
import { subscriptionTiers } from './data/mockData'
import { User } from './types'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Real-time odds data
  const {
    events,
    bookmakers,
    loading: oddsLoading,
    error: oddsError,
    lastUpdated,
    nextUpdate,
    rateLimitRemaining,
    refreshData,
    isRealTime
  } = useOddsData({
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000 // 5 minutes
  })

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      if (state.user) {
        setUser({
          id: state.user.id,
          email: state.user.email || '',
          subscription: 'free' // Default subscription
        })
      } else {
        setUser(null)
      }
      setLoading(state.isLoading)
    })

    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold mb-4">Welcome to OddsCompare Pro</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to access the best sports betting odds comparison platform.
          </p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userEmail={user.email}
        userSubscription={user.subscription} 
      />
      
      <main>
        <HeroSection />
        
        <section id="odds" className="py-16">
          <div className="container mx-auto px-4 space-y-6">
            <RealTimeStatus
              isRealTime={isRealTime}
              loading={oddsLoading}
              error={oddsError}
              lastUpdated={lastUpdated}
              nextUpdate={nextUpdate}
              rateLimitRemaining={rateLimitRemaining}
              onRefresh={refreshData}
            />
            
            <OddsTable 
              events={events}
              bookmakers={bookmakers}
              userSubscription={user.subscription}
            />
          </div>
        </section>

        <FeaturesSection />
        
        <PricingSection 
          tiers={subscriptionTiers}
          currentTier={user.subscription}
        />
      </main>

      <Footer />
    </div>
  )
}

export default App