"use client"

import { AppLayout } from "@/components/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { RoleGuard } from "@/components/role-guard"
import JobDescriptionsLibrary from "@/components/pages/ai/job-descriptions-library"

export default function Page() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["user"]} fallbackMessage="This page is only accessible to job seeker accounts.">
        <AppLayout>
          <JobDescriptionsLibrary />
        </AppLayout>
      </RoleGuard>
    </AuthGuard>
  )
}
