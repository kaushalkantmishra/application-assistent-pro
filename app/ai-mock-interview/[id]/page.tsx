"use client"

import { AuthGuard } from "@/components/auth-guard"
import { RoleGuard } from "@/components/role-guard"
import AIMockWorkspace from "@/components/pages/ai/workspace"
import { useParams } from "next/navigation"

export default function Page() {
  const params = useParams()
  const sessionId = params.id as string

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["user", "interviewer"]} fallbackMessage="Please log in first.">
        <div className="p-6 bg-slate-900 min-h-screen">
          <AIMockWorkspace sessionId={sessionId} />
        </div>
      </RoleGuard>
    </AuthGuard>
  )
}
