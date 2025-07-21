import { useState } from 'react'
import { SubscriptionTier } from '../../types'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Check, Star, Crown, CreditCard, Zap } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentTier: 'free' | 'advanced' | 'pro'
  tiers: SubscriptionTier[]
}

export function UpgradeModal({ isOpen, onClose, currentTier, tiers }: UpgradeModalProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [isUpgrading, setIsUpgrading] = useState(false)

  const availableTiers = tiers.filter(tier => {
    if (currentTier === 'free') return tier.id !== 'free'
    if (currentTier === 'advanced') return tier.id === 'pro'
    return false // Pro users can't upgrade further
  })

  const handleUpgrade = async (tierId: string) => {
    setIsUpgrading(true)
    setSelectedTier(tierId)
    
    try {
      // Simulate upgrade process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, you would:
      // 1. Create Stripe checkout session
      // 2. Process payment
      // 3. Update user subscription in database
      // 4. Refresh user data
      
      console.log(`Upgrading to ${tierId}`)
      alert(`Upgrade to ${tierId} successful! (Demo mode)`)
      onClose()
    } catch (error) {
      console.error('Upgrade failed:', error)
      alert('Upgrade failed. Please try again.')
    } finally {
      setIsUpgrading(false)
      setSelectedTier(null)
    }
  }

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'advanced': return <CreditCard className="h-5 w-5" />
      case 'pro': return <Crown className="h-5 w-5" />
      default: return <Zap className="h-5 w-5" />
    }
  }

  const getTierColor = (tierId: string) => {
    switch (tierId) {
      case 'advanced': return 'border-blue-200 bg-blue-50/50'
      case 'pro': return 'border-purple-200 bg-purple-50/50'
      default: return 'border-gray-200'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-primary" />
            <span>Upgrade Your Plan</span>
          </DialogTitle>
          <DialogDescription>
            Unlock more features and get access to premium odds data from all bookmakers.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {availableTiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${getTierColor(tier.id)} ${
                tier.id === 'advanced' ? 'ring-2 ring-primary/20' : ''
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

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-2">
                  {getTierIcon(tier.id)}
                </div>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-foreground">
                    ${tier.price}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sports:</span>
                    <span className="font-medium">
                      {tier.maxSports === -1 ? 'Unlimited' : tier.maxSports}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Alerts:</span>
                    <span className="font-medium">{tier.hasAlerts ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Analytics:</span>
                    <span className="font-medium">{tier.hasAnalytics ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">API Access:</span>
                    <span className="font-medium">{tier.hasApi ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={isUpgrading}
                  variant={tier.id === 'advanced' ? 'default' : 'outline'}
                >
                  {isUpgrading && selectedTier === tier.id ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Upgrade to ${tier.name}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
              <Check className="h-3 w-3 text-green-600" />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">30-day money-back guarantee</p>
              <p>Try any plan risk-free. Cancel anytime within 30 days for a full refund.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}