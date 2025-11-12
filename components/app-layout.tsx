"use client"

import type React from "react"

import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { AuthGuard } from "@/components/auth-guard"
import { AIChatbot } from "@/components/ai-chatbot"
import { useSidebar } from "@/contexts/sidebar-context"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isCollapsed, setIsCollapsed } = useSidebar()

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        <Sidebar />

        <div className={`flex-1 transition-all duration-200 ${isCollapsed ? "lg:ml-[72px]" : "lg:ml-64"}`}>
          <AppHeader isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />

          <main className="p-4 lg:p-8">{children}</main>
        </div>
        
        <AIChatbot />
      </div>
    </AuthGuard>
  )
}
