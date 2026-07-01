import { AppLayout } from "@/components/app-layout"
import ResumeDashboardPage from "@/components/pages/resume/resume-dashboard"

export const metadata = {
  title: "Resume Builder & Manager - Application Assistant",
  description: "Create and manage your professional resumes.",
}

export default function ResumesRoute() {
  return (
    <AppLayout>
      <ResumeDashboardPage />
    </AppLayout>
  )
}
