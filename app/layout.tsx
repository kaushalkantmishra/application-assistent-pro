import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/components/auth-provider"
import { SidebarProvider } from "@/contexts/sidebar-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Application Assistant - Job Application Tracker",
  description: "Track and manage your job applications, receive reminders, and prepare for interviews",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <SidebarProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </SidebarProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
