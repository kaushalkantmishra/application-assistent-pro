"use client"

import { AppLayout } from "@/components/app-layout"
import LatestJobsPage from "@/components/pages/job-seeker/latest-jobs/index"

export default function Page() {
  return (
    <AppLayout>
      <LatestJobsPage />
    </AppLayout>
  )
}
