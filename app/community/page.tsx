"use client"

import { AppLayout } from "@/components/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { RoleGuard } from "@/components/role-guard"
import CommunityForum from "@/components/pages/community/forum"

export default function Page() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["user", "interviewer", "admin"]} fallbackMessage="Please log in first.">
        <AppLayout>
          <CommunityForum />
        </AppLayout>
      </RoleGuard>
    </AuthGuard>
  )
}
