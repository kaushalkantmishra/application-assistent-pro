"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRole } from "@/hooks/use-role"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { LogOut, User, Settings, ChevronLeft, ChevronRight, Mail, Calendar } from "lucide-react"
import LogoutModal from "./modals/logout-modal"
import { AnalogClock } from "./analog-clock"

interface AppHeaderProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function AppHeader({ isCollapsed, onToggleCollapse }: AppHeaderProps) {
  const { data: session } = useSession()
  const role = useRole()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Debug session data
  console.log('Session data:', session)
  console.log('User image URL:', session?.user?.image)

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

      {/* System Time and Date */}
      <div className="flex items-center gap-3">
        {/* <AnalogClock time={currentTime} size={36} /> */}
        <div className="flex flex-col text-sm">
          <div className="font-medium">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          {/* <div className="text-muted-foreground">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </div> */}
        </div>
      </div>

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
              className="relative h-10 w-10 rounded-full p-0"
              onClick={() => setIsProfileModalOpen(true)}
            >
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="h-10 w-10 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.log('Header image failed to load:', e)
                    const target = e.currentTarget as HTMLImageElement
                    target.style.display = 'none'
                    target.insertAdjacentHTML('afterend', `<div class="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">${getUserInitials(session.user?.name || "")}</div>`)
                  }}
                  onLoad={() => console.log('Header image loaded successfully')}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {getUserInitials(session.user?.name || "")}
                </div>
              )}
            </Button>

            {/* Logout button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLogoutDialog(true)}
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
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.log('Modal image failed to load:', e)
                  const target = e.currentTarget as HTMLImageElement
                  target.style.display = 'none'
                  target.insertAdjacentHTML('afterend', `<div class="h-24 w-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-medium border-2 border-gray-200">${getUserInitials(session?.user?.name || "")}</div>`)
                }}
                onLoad={() => console.log('Modal image loaded successfully')}
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-medium border-2 border-gray-200">
                {getUserInitials(session?.user?.name || "")}
              </div>
            )}

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

      {/* Logout Confirmation Dialog */}
      <LogoutModal
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
      />
    </header>
  )
}
