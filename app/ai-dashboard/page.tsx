"use client"

import { AppLayout } from "@/components/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { RoleGuard } from "@/components/role-guard"
import AiDashboard from "@/components/pages/ai/ai-dashboard"

export default function Page() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["user"]} fallbackMessage="This page is only accessible to job seeker accounts.">
        <AppLayout>
          <AiDashboard />
        </AppLayout>
      </RoleGuard>
    </AuthGuard>
  )
}
