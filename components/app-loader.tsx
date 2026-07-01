"use client"

import { useEffect, useState } from "react"
import { Briefcase, MessageSquare, Sparkles, Search, Compass } from "lucide-react"

interface AppLoaderProps {
  message?: string
  variant?: "briefcase" | "skeleton" | "radar"
}

export function AppLoader({ message, variant = "radar" }: AppLoaderProps) {
  const [dots, setDots] = useState("")
  const [currentText, setCurrentText] = useState(message || "Loading your workspace")

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Rotate messages if no custom message is provided
  useEffect(() => {
    if (message) return
    const messages = [
      "Optimizing your application tracker",
      "Scanning top corporate & government jobs",
      "Fetching personalized interview questions",
      "Connecting with expert interviewers",
      "Analyzing profile and resume details",
    ]
    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % messages.length
      setCurrentText(messages[index])
    }, 2000)
    return () => clearInterval(interval)
  }, [message])

  // 1. Sleek Skeleton Card Loader
  if (variant === "skeleton") {
    return (
      <div className="w-full space-y-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-6 w-20 bg-muted animate-pulse rounded-md" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-border rounded-xl p-6 bg-card space-y-4 shadow-sm relative overflow-hidden">
            {/* Shimmer overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-1/3 bg-muted animate-pulse rounded-md" />
                <div className="h-4 w-1/4 bg-muted animate-pulse rounded-md" />
              </div>
              <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted/80 animate-pulse rounded-md" />
              <div className="h-3 w-5/6 bg-muted/80 animate-pulse rounded-md" />
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 2. Radar/Dashboard Scan Loader
  if (variant === "radar") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[45vh] p-8 text-center bg-gradient-to-b from-transparent to-muted/20 rounded-2xl border border-dashed border-muted/50 my-4">
        <div className="relative mb-8">
          {/* Outer sweeping radar ring */}
          <div className="absolute -inset-8 rounded-full border border-primary/20 animate-[ping_2s_infinite]" />
          <div className="absolute -inset-4 rounded-full border border-secondary/20 animate-[pulse_1.5s_infinite]" />
          <div className="absolute inset-0 rounded-full border-2 border-primary/10" />

          {/* Glowing central scanner */}
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-background border border-border shadow-2xl text-primary animate-[spin_8s_linear_infinite]">
            <Compass className="h-10 w-10 text-primary/80" />
            
            {/* Sweep indicator dot */}
            <div className="absolute top-1 right-5 w-2 h-2 rounded-full bg-secondary animate-ping" />
          </div>

          {/* Corner anchor pulses */}
          <div className="absolute -top-4 -left-4 w-2 h-2 rounded-full bg-primary animate-pulse" />
          <div className="absolute -bottom-4 -right-4 w-2 h-2 rounded-full bg-secondary animate-pulse" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider animate-pulse">
            <Search className="h-3 w-3 animate-bounce" />
            Active Scan System
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground transition-all duration-300">
            {currentText}
            <span className="inline-block w-8 text-left">{dots}</span>
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Configuring metrics, data charts, and matching patterns for your session.
          </p>
        </div>
      </div>
    )
  }

  // 3. Central Briefcase Loader
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping duration-1000 scale-150"></div>
        <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse scale-200"></div>

        <div className="absolute -top-3 -right-3 text-secondary animate-bounce delay-150">
          <Sparkles className="h-5 w-5 fill-current" />
        </div>
        <div className="absolute -bottom-2 -left-3 text-accent animate-pulse">
          <MessageSquare className="h-5 w-5 fill-current" />
        </div>

        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 shadow-lg text-white transform hover:rotate-6 transition-transform duration-300">
          <Briefcase className="h-8 w-8 animate-pulse" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight text-foreground transition-all duration-300">
          {currentText}
          <span className="inline-block w-8 text-left">{dots}</span>
        </h3>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto animate-pulse">
          Preparing your career assistance panel
        </p>
      </div>
    </div>
  )
}
