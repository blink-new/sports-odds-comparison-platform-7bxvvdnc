import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Search, TrendingUp, Users, Zap } from 'lucide-react'

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = [
    { icon: TrendingUp, label: 'Live Events', value: '500+' },
    { icon: Users, label: 'Bookmakers', value: '15+' },
    { icon: Zap, label: 'Real-time Updates', value: '24/7' }
  ]

  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6">
            🚀 Compare odds across 15+ bookmakers
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Find the Best Betting Odds
            <br />
            <span className="text-primary">Instantly</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Compare real-time odds across all major sportsbooks. Never miss the best line again with our comprehensive odds comparison platform.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search teams, leagues, or events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-base"
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="text-base px-8">
              Start Comparing Odds
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8">
              View Live Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
      </div>
    </section>
  )
}