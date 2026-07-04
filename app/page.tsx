"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { AppLayout } from "@/components/app-layout"
import JobSeekerDashboard from "@/components/pages/job-seeker/dashboard/index"
import InterviewerDashboard from "@/components/pages/interviewer/dashboard/index"
import { useRole } from "@/hooks/use-role"
import { AppLoader } from "@/components/app-loader"

export default function Page() {
  const { data: session, status } = useSession()
  const role = useRole()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email === "kaushalkantmishra127@gmail.com") {
      router.push("/admin")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background w-full">
        <AppLoader message="Preparing workspace..." />
      </div>
    )
  }

  if (session?.user?.email === "kaushalkantmishra127@gmail.com") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background w-full">
        <AppLoader message="Redirecting to Admin console..." />
      </div>
    )
  }

  return (
    <AppLayout>
      {role === "interviewer" ? <InterviewerDashboard /> : <JobSeekerDashboard />}
    </AppLayout>
  )
}