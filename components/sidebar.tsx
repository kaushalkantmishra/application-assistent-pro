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
  Brain,
  Trophy,
  CreditCard,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import LogoutModal from "./modals/logout-modal"

const jobSeekerGroups = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "My Profile", href: "/profile", icon: User },
    ],
  },
  {
    title: "Credentials",
    items: [
      { name: "Resume Builder", href: "/resumes", icon: FileText },
      { name: "Template Library", href: "/templates", icon: Layout },
      { name: "Cover Letters", href: "/cover-letters", icon: Mail },
      { name: "Coding Profiles", href: "/coding-profiles", icon: Code },
    ],
  },
  {
    title: "AI Tools",
    items: [
      { name: "AI Dashboard", href: "/ai-dashboard", icon: Sparkles },
      { name: "AI Career Advisor", href: "/ai-advisor", icon: BrainCircuit },
      { name: "AI Mock Interview", href: "/ai-mock-interview", icon: Brain },
    ],
  },
  {
    title: "Preparation",
    items: [
      { name: "Study Materials", href: "/study-materials", icon: BookOpen },
      { name: "Interview Directory", href: "/interviewer-directory", icon: Users },
      { name: "Interview Preparation", href: "/interview-prep", icon: MessageSquare },
    ],
  },
  {
    title: "Jobs & Forum",
    items: [
      { name: "Job Library", href: "/job-descriptions", icon: Briefcase },
      { name: "Community Forum", href: "/community", icon: MessageSquare },
      { name: "Achievements & Streaks", href: "/gamification", icon: Trophy },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Billing & Plans", href: "/billing", icon: CreditCard },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
]

const interviewerGroups = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Profile", href: "/interviewer-profile", icon: UserCheck },
    ],
  },
  {
    title: "Interviews",
    items: [
      { name: "Availability", href: "/interviewer/availability", icon: Calendar },
      { name: "Bookings", href: "/interviewer/bookings", icon: CheckSquare },
      { name: "Candidates", href: "/interviewer/candidates", icon: Users },
    ],
  },
  {
    title: "Messages",
    items: [
      { name: "Chat", href: "/interviewer/chat", icon: MessageCircle },
      { name: "Reviews", href: "/interviewer/reviews", icon: Star },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
]

const adminGroups = [
  {
    title: "Management",
    items: [
      { name: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
]

export function Sidebar() {
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar()
  const pathname = usePathname()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const { data: session } = useSession()
  const role = useRole()

  const navigationGroups = (session?.user as any)?.role === "admin"
    ? adminGroups
    : role === "interviewer"
    ? interviewerGroups
    : jobSeekerGroups

  return (
    <>
      {/* Sidebar Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-sidebar border-r border-sidebar-border transform transition-all duration-300 ease-in-out lg:translate-x-0 no-print",
          isCollapsed ? "w-[72px]" : "w-64",
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div
            className={cn(
              "flex items-center border-b border-sidebar-border transition-all duration-300 h-16",
              isCollapsed ? "justify-center px-3" : "px-5"
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
                  isCollapsed ? "w-8 h-8" : "w-6 h-6"
                )}
              >
                <FileText className={cn("text-primary-foreground", isCollapsed ? "w-4 h-4" : "w-3.5 h-3.5")} />
              </div>
              {!isCollapsed && (
                <span className="text-sm font-semibold text-sidebar-foreground whitespace-nowrap">
                  Application Assistant
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={cn("flex-1 px-3 py-3 overflow-y-auto scrollbar-thin", isCollapsed ? "space-y-1.5" : "space-y-4")}>
            {navigationGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                {/* Section Header */}
                {!isCollapsed && (
                  <h3 className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 mt-3 first:mt-0">
                    {group.title}
                  </h3>
                )}
                
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center text-xs font-medium rounded-lg transition-all duration-205 ease-in-out",
                        isCollapsed ? "justify-center py-2" : "px-3 py-2",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={cn(
                          "transition-all duration-300 ease-in-out shrink-0",
                          isCollapsed
                            ? "h-4 w-4" 
                            : "h-3.5 w-3.5 mr-2.5"
                        )}
                      />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-sidebar-border space-y-2">
            {session && (
              <Button
                variant="ghost"
                onClick={() => setShowLogoutDialog(true)}
                className={cn(
                  "w-full justify-start text-xs text-muted-foreground hover:text-foreground transition-all duration-200 h-9",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? "Logout" : undefined}
              >
                <LogOut
                  className={cn(
                    "transition-all duration-300 ease-in-out",
                    isCollapsed ? "h-4 w-4" : "h-3.5 w-3.5 mr-2"
                  )}
                />
                {!isCollapsed && "Logout"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Logout Confirmation Dialog */}
      <LogoutModal open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />
    </>
  )
}
