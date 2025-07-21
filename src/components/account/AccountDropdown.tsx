import { useState } from 'react'
import { blink } from '../../blink/client'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { User, LogOut, CreditCard, Settings, Crown } from 'lucide-react'

interface AccountDropdownProps {
  userEmail: string
  userSubscription: 'free' | 'advanced' | 'pro'
  onUpgrade: () => void
}

export function AccountDropdown({ userEmail, userSubscription, onUpgrade }: AccountDropdownProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await blink.auth.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getSubscriptionBadge = () => {
    const badges = {
      free: { label: 'Free', variant: 'secondary' as const, icon: null },
      advanced: { label: 'Advanced', variant: 'default' as const, icon: <CreditCard className="h-3 w-3" /> },
      pro: { label: 'Pro', variant: 'default' as const, icon: <Crown className="h-3 w-3" /> }
    }
    return badges[userSubscription]
  }

  const badge = getSubscriptionBadge()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{userEmail}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userEmail}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={badge.variant} className="text-xs">
                {badge.icon && <span className="mr-1">{badge.icon}</span>}
                {badge.label}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {userSubscription !== 'pro' && (
          <>
            <DropdownMenuItem onClick={onUpgrade} className="cursor-pointer">
              <Crown className="mr-2 h-4 w-4" />
              <span>Upgrade Plan</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Account Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer text-red-600 focus:text-red-600"
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}