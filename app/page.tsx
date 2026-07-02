"use client"

import { AppLayout } from "@/components/app-layout"
import JobSeekerDashboard from "@/components/pages/job-seeker/dashboard/index"
import InterviewerDashboard from "@/components/pages/interviewer/dashboard/index"
import { useRole } from "@/hooks/use-role"

export default function Page() {
  const role = useRole()

  return (
    <AppLayout>
      {role === "interviewer" ? <InterviewerDashboard /> : <JobSeekerDashboard />}
    </AppLayout>
  )
}