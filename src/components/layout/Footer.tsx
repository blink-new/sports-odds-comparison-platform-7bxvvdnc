import { TrendingUp } from 'lucide-react'

export function Footer() {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Odds Comparison', href: '#' },
        { name: 'Live Updates', href: '#' },
        { name: 'API Access', href: '#' },
        { name: 'Mobile App', href: '#' }
      ]
    },
    {
      title: 'Sports',
      links: [
        { name: 'NFL', href: '#' },
        { name: 'NBA', href: '#' },
        { name: 'MLB', href: '#' },
        { name: 'NHL', href: '#' },
        { name: 'Soccer', href: '#' },
        { name: 'Tennis', href: '#' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '#' },
        { name: 'Contact', href: '#' },
        { name: 'Careers', href: '#' },
        { name: 'Press', href: '#' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '#' },
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
        { name: 'Cookie Policy', href: '#' }
      ]
    }
  ]

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">OddsCompare Pro</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              The most comprehensive sports betting odds comparison platform. Find the best lines across all major bookmakers.
            </p>
            <p className="text-xs text-muted-foreground">
              © 2024 OddsCompare Pro. All rights reserved.
            </p>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Gambling can be addictive. Please bet responsibly.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Responsible Gaming
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                18+ Only
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}