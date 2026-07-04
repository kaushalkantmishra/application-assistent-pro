"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { AppLayout } from "@/components/app-layout"
import AdminDashboard from "@/components/pages/admin/dashboard"
import { AppLoader } from "@/components/app-loader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Lock } from "lucide-react"

export default function Page() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <AppLoader variant="radar" message="Authenticating session and preparing administrator workspace" />
      </div>
    )
  }

  // If not authenticated, show a public Google Login prompt on the /admin route
  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans text-xs">
        <Card className="max-w-md w-full border-slate-800 bg-slate-900 text-white shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-indigo-950 border border-indigo-700/50 rounded-full flex items-center justify-center mb-3">
              <Shield className="h-6 w-6 text-indigo-400" />
            </div>
            <CardTitle className="text-sm font-bold tracking-wide uppercase">Admin Console Sign In</CardTitle>
            <CardDescription className="text-[11px] text-slate-400 mt-1">
              Please authenticate via Google to access administrator configurations.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col gap-3">
            <Button
              onClick={() => signIn("google")}
              className="bg-indigo-650 hover:bg-indigo-755 text-white font-bold h-10 w-full rounded-lg cursor-pointer"
            >
              Sign In with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If logged in, check if the email matches the authorized admin
  const authorizedEmail = "kaushalkantmishra127@gmail.com"
  const userEmail = session.user.email

  if (userEmail !== authorizedEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans text-xs">
        <Card className="max-w-md w-full border-red-900 bg-slate-900 text-white shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-red-950 border border-red-700/50 rounded-full flex items-center justify-center mb-3">
              <Lock className="h-6 w-6 text-red-400" />
            </div>
            <CardTitle className="text-sm font-bold tracking-wide uppercase text-red-400">Access Restricted</CardTitle>
            <CardDescription className="text-[11px] text-slate-400 mt-1">
              Only {authorizedEmail} is authorized to access the administrator panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col gap-3">
            <div className="p-3 border border-slate-800 bg-slate-950 rounded-lg text-slate-400 text-center leading-relaxed">
              Your current logged in account is:<br />
              <span className="font-bold text-white text-[11.5px]">{userEmail}</span>
            </div>
            <Button
              onClick={() => signOut()}
              className="bg-red-650 hover:bg-red-700 text-white font-bold h-10 w-full rounded-lg mt-1 cursor-pointer"
            >
              Sign Out / Try Another Account
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If authorized, render Admin Dashboard inside Layout
  return (
    <AppLayout>
      <AdminDashboard />
    </AppLayout>
  )
}
