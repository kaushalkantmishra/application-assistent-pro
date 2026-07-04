"use client"

import { AppLayout } from "@/components/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { RoleGuard } from "@/components/role-guard"
import AvailabilityPage from "@/components/pages/interviewer/availability"

export default function Page() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["interviewer"]} fallbackMessage="This page is only accessible to interviewer accounts.">
        <AppLayout>
          <AvailabilityPage />
        </AppLayout>
      </RoleGuard>
    </AuthGuard>
  )
}
