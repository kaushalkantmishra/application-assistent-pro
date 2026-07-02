"use client"

import { AppLayout } from "@/components/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { RoleGuard } from "@/components/role-guard"
import FeedbackReport from "@/components/pages/interviewer/feedback-report"
import { useParams } from "next/navigation"

export default function Page() {
  const params = useParams()
  const bookingId = params.id as string

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["user"]} fallbackMessage="This page is only accessible to job seeker accounts.">
        <AppLayout>
          <FeedbackReport bookingId={bookingId} />
        </AppLayout>
      </RoleGuard>
    </AuthGuard>
  )
}
