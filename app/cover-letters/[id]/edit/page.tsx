"use client"

import { use } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { RoleGuard } from "@/components/role-guard"
import CoverLetterEditor from "@/components/pages/cover-letter/cover-letter-editor"

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["user"]} fallbackMessage="This page is only accessible to job seeker accounts.">
        <CoverLetterEditor id={id} />
      </RoleGuard>
    </AuthGuard>
  )
}
