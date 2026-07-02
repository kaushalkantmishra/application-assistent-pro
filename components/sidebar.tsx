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
  Layout,
  MessageSquare,
  Menu,
  X,
  BookOpen,
  Users,
  UserCheck,
  LogOut,
  ClipboardList,
  Mail,
  Calendar,
  Settings,
  Sparkles,
  BrainCircuit,
  Briefcase,
  Code,
  Star,
  MessageCircle,
  CheckSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import LogoutModal from "./modals/logout-modal"

const jobSeekerNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "My Profile", href: "/profile", icon: User },
  { name: "Resume Builder", href: "/resumes", icon: FileText },
  { name: "Template Library", href: "/templates", icon: Layout },
  { name: "Cover Letters", href: "/cover-letters", icon: Mail },
  { name: "Coding Profiles", href: "/coding-profiles", icon: Code },
  { name: "Study Materials", href: "/study-materials", icon: BookOpen },
  { name: "Interview Preparation", href: "/interview-prep", icon: MessageSquare },
  { name: "AI Dashboard", href: "/ai-dashboard", icon: Sparkles },
  { name: "AI Career Advisor", href: "/ai-advisor", icon: BrainCircuit },
  { name: "Job Library", href: "/job-descriptions", icon: Briefcase },
  { name: "Settings", href: "/settings", icon: Settings },
]

const interviewerNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Profile", href: "/interviewer-profile", icon: UserCheck },
  { name: "Availability", href: "/interviewer/availability", icon: Calendar },
  { name: "Bookings", href: "/interviewer/bookings", icon: CheckSquare },
  { name: "Candidates", href: "/interviewer/candidates", icon: Users },
  { name: "Chat", href: "/interviewer/chat", icon: MessageCircle },
  { name: "Reviews", href: "/interviewer/reviews", icon: Star },
  { name: "Settings", href: "/settings", icon: Settings },
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
      <div className="lg:hidden fixed top-4 left-4 z-50 no-print">
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
          "fixed inset-y-0 left-0 z-40 bg-sidebar border-r border-sidebar-border transform transition-all duration-300 ease-in-out lg:translate-x-0 no-print",
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
          <nav className="flex-1 px-3 py-3 space-y-1">
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
                        : "h-4 w-5 mr-3"
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
