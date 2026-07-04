"use client"

import { AppLayout } from "@/components/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { RoleGuard } from "@/components/role-guard"
import AIMockLobby from "@/components/pages/ai/lobby"

export default function Page() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["user", "interviewer"]} fallbackMessage="Please log in first.">
        <AppLayout>
          <AIMockLobby />
        </AppLayout>
      </RoleGuard>
    </AuthGuard>
  )
}
