"use client"

import { AppLayout } from "@/components/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { RoleGuard } from "@/components/role-guard"
import AiAdvisor from "@/components/pages/ai/ai-advisor"

export default function Page() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["user"]} fallbackMessage="This page is only accessible to job seeker accounts.">
        <AppLayout>
          <AiAdvisor />
        </AppLayout>
      </RoleGuard>
    </AuthGuard>
  )
}
