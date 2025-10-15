"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { AuthGuard } from "@/components/auth-guard"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        <Sidebar isCollapsed={isCollapsed } setIsCollapsed={setIsCollapsed}/>

        <div className={`flex-1 transition-all duration-200 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
          <AppHeader isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />

          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
