import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { 
  BarChart3, 
  Bell, 
  Clock, 
  Shield, 
  Smartphone, 
  Zap,
  TrendingUp,
  Database,
  Globe
} from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: BarChart3,
      title: 'Real-Time Odds Comparison',
      description: 'Compare live odds across 15+ major bookmakers in a clean, easy-to-read table format.',
      badge: 'Core Feature'
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Get notified when odds move in your favor or when the best lines become available.',
      badge: 'Advanced+'
    },
    {
      icon: TrendingUp,
      title: 'Best Odds Highlighting',
      description: 'Instantly spot the best odds with our intelligent highlighting system.',
      badge: 'All Plans'
    },
    {
      icon: Clock,
      title: 'Live Updates',
      description: 'Odds update in real-time so you never miss a line movement or opportunity.',
      badge: 'Real-time'
    },
    {
      icon: Database,
      title: 'Historical Data',
      description: 'Access historical odds data and trends to make more informed betting decisions.',
      badge: 'Pro Only'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Fully responsive design that works perfectly on all devices and screen sizes.',
      badge: 'All Plans'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime guarantee for consistent access.',
      badge: 'Enterprise'
    },
    {
      icon: Zap,
      title: 'API Access',
      description: 'Integrate our odds data into your own applications with our robust API.',
      badge: 'Pro Only'
    },
    {
      icon: Globe,
      title: 'Multiple Sports',
      description: 'Coverage across NFL, NBA, MLB, NHL, Soccer, Tennis, and many more sports.',
      badge: 'Expanding'
    }
  ]

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case 'Core Feature':
        return 'default'
      case 'Advanced+':
        return 'secondary'
      case 'Pro Only':
        return 'outline'
      case 'Real-time':
        return 'default'
      default:
        return 'secondary'
    }
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Features for Smart Bettors</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to find the best odds and make informed betting decisions, all in one platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant={getBadgeVariant(feature.badge)} className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}