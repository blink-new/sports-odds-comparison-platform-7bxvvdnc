import { useState } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Menu, TrendingUp, Crown } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { AccountDropdown } from '../account/AccountDropdown'
import { UpgradeModal } from '../account/UpgradeModal'
import { subscriptionTiers } from '../../data/mockData'

interface HeaderProps {
  userEmail: string
  userSubscription: 'free' | 'advanced' | 'pro'
}

export function Header({ userEmail, userSubscription }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const navigation = [
    { name: 'Home', href: '#' },
    { name: 'Odds', href: '#odds' },
    { name: 'Sports', href: '#sports' },
    { name: 'Pricing', href: '#pricing' }
  ]

  const getSubscriptionBadge = () => {
    const badges = {
      free: { label: 'Free', variant: 'secondary' as const },
      advanced: { label: 'Advanced', variant: 'default' as const },
      pro: { label: 'Pro', variant: 'default' as const }
    }
    return badges[userSubscription]
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">OddsCompare Pro</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Badge variant={getSubscriptionBadge().variant}>
              {getSubscriptionBadge().label}
            </Badge>
            <AccountDropdown 
              userEmail={userEmail}
              userSubscription={userSubscription}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
            {userSubscription !== 'pro' && (
              <Button size="sm" onClick={() => setShowUpgradeModal(true)}>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-2 mb-4">
                    <Badge variant={getSubscriptionBadge().variant}>
                      {getSubscriptionBadge().label}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <AccountDropdown 
                      userEmail={userEmail}
                      userSubscription={userSubscription}
                      onUpgrade={() => {
                        setShowUpgradeModal(true)
                        setIsOpen(false)
                      }}
                    />
                    {userSubscription !== 'pro' && (
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          setShowUpgradeModal(true)
                          setIsOpen(false)
                        }}
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={userSubscription}
        tiers={subscriptionTiers}
      />
    </header>
  )
}