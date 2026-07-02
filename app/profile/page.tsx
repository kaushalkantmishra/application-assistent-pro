"use client"

import { AppLayout } from "@/components/app-layout"
import JobSeekerProfile from "@/components/pages/job-seeker/profile/index"
import InterviewerProfile from "@/components/pages/interviewer/profile/index"
import { useRole } from "@/hooks/use-role"

export default function Page() {
  const role = useRole()

  return (
    <AppLayout>
      {role === "interviewer" ? <InterviewerProfile /> : <JobSeekerProfile />}
    </AppLayout>
  )
}