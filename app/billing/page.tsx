"use client"

import { AppLayout } from "@/components/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { RoleGuard } from "@/components/role-guard"
import BillingDashboard from "@/components/pages/billing/dashboard"

export default function Page() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["user", "interviewer"]} fallbackMessage="Please log in first.">
        <AppLayout>
          <BillingDashboard />
        </AppLayout>
      </RoleGuard>
    </AuthGuard>
  )
}
