"use client"

import { AppLayout } from "@/components/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { RoleGuard } from "@/components/role-guard"
import FeedbackForm from "@/components/pages/interviewer/feedback-form"

export default function Page() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["interviewer"]} fallbackMessage="This page is only accessible to interviewer accounts.">
        <AppLayout>
          <FeedbackForm />
        </AppLayout>
      </RoleGuard>
    </AuthGuard>
  )
}
