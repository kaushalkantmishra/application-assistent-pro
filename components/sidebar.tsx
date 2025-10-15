"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";
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
  User2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const jobSeekerNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Applications", href: "/applications", icon: FileText },
  { name: "Govt Jobs", href: "/govt-jobs", icon: Building2 },
  { name: "Latest Jobs", href: "/latest-jobs", icon: Briefcase },
  { name: "Interview Prep", href: "/interview-prep", icon: MessageSquare },
  { name: "Reading Materials", href: "/reading-materials", icon: BookOpen },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const interviewerNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Profile", href: "/profile", icon: User },
  {
    name: "Interviewer Profile",
    href: "/interviewer-profile",
    icon: UserCheck,
  },
  {
    name: "Interviewer Directory",
    href: "/interviewer-directory",
    icon: Users,
  },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const navigation =
    user?.role === "interviewer" ? interviewerNavigation : jobSeekerNavigation;

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
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-sidebar border-r border-sidebar-border transform transition-all duration-200 ease-in-out lg:translate-x-0",
          isCollapsed ? "w-16" : "w-64",
          isMobileMenuOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-sidebar-border">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              {!isCollapsed && (
                <span className="text-lg font-semibold text-sidebar-foreground">
                  Application Assistant
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  // className={cn(
                  //   "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  //   isCollapsed ? "" : "",
                  //   isActive
                  //     ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  //     : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  // )}
                  className={`flex justify-start items-center gap-2 p-2 ${
                    isActive ? "bg-red-300 rounded-xl p-2" : ""
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn("h-4 w-4", !isCollapsed && "")} />
                  {/* <User2 style={{height: "20px"}}/> */}
                  {!isCollapsed && item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-sidebar-border">
            {!isCollapsed && (
              <p className="text-xs text-muted-foreground text-center">
                Built with v0 by Vercel
              </p>
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
    </>
  );
}
