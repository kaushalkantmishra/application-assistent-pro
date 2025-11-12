"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useRole } from "@/hooks/use-role"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  User,
  FileText,
  Building2,
  Briefcase,
  MessageSquare,
  BarChart3,
  Menu,
  X,
  BookOpen,
  Users,
  UserCheck,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import LogoutModal from "./modals/logout-modal"

const jobSeekerNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Applications", href: "/applications", icon: FileText },
  { name: "Govt Jobs", href: "/govt-jobs", icon: Building2 },
  { name: "Latest Jobs", href: "/latest-jobs", icon: Briefcase },
  { name: "Interview Prep", href: "/interview-prep", icon: MessageSquare },
  { name: "Reading Materials", href: "/reading-materials", icon: BookOpen },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
]

const interviewerNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Interviewer Profile", href: "/interviewer-profile", icon: UserCheck },
  { name: "Interviewer Directory", href: "/interviewer-directory", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
]

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const { data: session } = useSession()
  const role = useRole()

  const navigation = role === "interviewer" ? interviewerNavigation : jobSeekerNavigation

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-card"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-sidebar border-r border-sidebar-border transform transition-all duration-300 ease-in-out lg:translate-x-0",
          isCollapsed ? "w-[72px]" : "w-64",
          isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div
            className={cn(
              "flex items-center border-b border-sidebar-border transition-all duration-300",
              isCollapsed ? "justify-center px-3 py-4" : "px-6 py-4"
            )}
          >
            <div
              className={cn(
                "flex items-center transition-all duration-300",
                isCollapsed ? "space-x-0" : "space-x-2"
              )}
            >
              <div
                className={cn(
                  "bg-primary rounded-lg flex items-center justify-center transition-all duration-300",
                  isCollapsed ? "w-10 h-10" : "w-8 h-8"
                )}
              >
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              {!isCollapsed && (
                <span className="text-base font-semibold text-sidebar-foreground whitespace-nowrap">
                  Application Assistant
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center text-sm font-medium rounded-lg transition-all duration-200 ease-in-out",
                    isCollapsed ? "justify-center py-3" : "px-4 py-3",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={cn(
                      "transition-all duration-300 ease-in-out",
                      isCollapsed
                        ? "h-6 w-[20px]" 
                        : "h-6 w-5 mr-3"
                    )}
                  />
                  {!isCollapsed && item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-sidebar-border space-y-2">
            {session && (
              <Button
                variant="ghost"
                onClick={() => setShowLogoutDialog(true)}
                className={cn(
                  "w-full justify-start text-muted-foreground hover:text-foreground transition-all duration-200",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? "Logout" : undefined}
              >
                <LogOut
                  className={cn(
                    "transition-all duration-300 ease-in-out",
                    isCollapsed ? "h-7 w-7" : "h-5 w-5 mr-2"
                  )}
                />
                {!isCollapsed && "Logout"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Logout Confirmation Dialog */}
      <LogoutModal open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />
    </>
  )
}
