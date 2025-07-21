import { useState } from 'react'
import { SubscriptionTier } from '../../types'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Check, Star } from 'lucide-react'
import { UpgradeModal } from '../account/UpgradeModal'

interface PricingSectionProps {
  tiers: SubscriptionTier[]
  currentTier?: string
}

export function PricingSection({ tiers, currentTier = 'free' }: PricingSectionProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const isCurrentTier = (tierId: string) => tierId === currentTier

  const handleUpgradeClick = (tierId: string) => {
    if (tierId === 'free') {
      // For free tier, just scroll to top or show sign up
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setShowUpgradeModal(true)
    }
  }

  return (
    <section id="pricing" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get access to the best odds across all major bookmakers. Start free and upgrade as you need more features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`relative ${
                tier.id === 'advanced' 
                  ? 'border-primary shadow-lg scale-105' 
                  : ''
              }`}
            >
              {tier.id === 'advanced' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">
                    ${tier.price}
                  </span>
                  {tier.price > 0 && <span className="text-muted-foreground">/month</span>}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-6 border-t">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Sports: {tier.maxSports === -1 ? 'Unlimited' : tier.maxSports}</div>
                    <div>Alerts: {tier.hasAlerts ? 'Yes' : 'No'}</div>
                    <div>Analytics: {tier.hasAnalytics ? 'Yes' : 'No'}</div>
                    <div>API Access: {tier.hasApi ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={isCurrentTier(tier.id) ? "secondary" : "default"}
                  disabled={isCurrentTier(tier.id)}
                  onClick={() => handleUpgradeClick(tier.id)}
                >
                  {isCurrentTier(tier.id) ? 'Current Plan' : 
                   tier.price === 0 ? 'Get Started' : 'Upgrade Now'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All plans include 24/7 customer support and a 30-day money-back guarantee.
          </p>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={currentTier as 'free' | 'advanced' | 'pro'}
        tiers={tiers}
      />
    </section>
  )
}