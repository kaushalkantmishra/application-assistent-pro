"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRole } from "@/hooks/use-role"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { LogOut, User, Settings, ChevronLeft, ChevronRight, Mail, Calendar } from "lucide-react"

interface AppHeaderProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function AppHeader({ isCollapsed, onToggleCollapse }: AppHeaderProps) {
  const { data: session } = useSession()
  const role = useRole()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const handleSignOut = () => {
    localStorage.removeItem('selectedRole')
    signOut({ callbackUrl: "/login" })
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* Sidebar toggle button */}
      <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="hidden lg:flex">
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <div className="flex-1" />

      {/* User menu */}
      {session?.user && (
        <div className="flex items-center gap-4">
          {/* Role badge */}
          <Badge variant={role === "interviewer" ? "secondary" : "default"}>
            {role === "interviewer" ? "Interviewer" : "Job Seeker"}
          </Badge>

          {/* User avatar - click to open profile */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              className="relative h-8 w-8 rounded-full"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                <AvatarFallback>{getUserInitials(session.user.name || "")}</AvatarFallback>
              </Avatar>
            </Button>
            
            {/* Logout button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSignOut}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile Details</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
              <AvatarFallback className="text-2xl">
                {getUserInitials(session?.user?.name || "")}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-4 w-full">
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Full Name</p>
                  <p className="text-sm text-muted-foreground">{session?.user?.name || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email Address</p>
                  <p className="text-sm text-muted-foreground">{session?.user?.email || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <Badge variant={role === "interviewer" ? "secondary" : "default"}>
                    {role === "interviewer" ? "Interviewer" : "Job Seeker"}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Session Expires</p>
                  <p className="text-sm text-muted-foreground">
                    {session?.expires ? new Date(session.expires).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
