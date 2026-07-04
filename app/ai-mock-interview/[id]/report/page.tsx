"use client"

import { AppLayout } from "@/components/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { RoleGuard } from "@/components/role-guard"
import AIMockReport from "@/components/pages/ai/report"
import { useParams } from "next/navigation"

export default function Page() {
  const params = useParams()
  const sessionId = params.id as string

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["user", "interviewer"]} fallbackMessage="Please log in first.">
        <AppLayout>
          <AIMockReport sessionId={sessionId} />
        </AppLayout>
      </RoleGuard>
    </AuthGuard>
  )
}
