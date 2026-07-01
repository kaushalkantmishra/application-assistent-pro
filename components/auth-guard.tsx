"use client"

import type React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { AppLoader } from "@/components/app-loader"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AppLoader variant="radar" message="Authenticating session and preparing workspace" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return <>{children}</>
}
