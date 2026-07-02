"use client"

import { use } from "react"
import { AuthGuard } from "@/components/auth-guard"
import MeetingWorkspace from "@/components/pages/meetings/workspace"

interface MeetingPageProps {
  params: Promise<{
    id: string
  }>
}

export default function MeetingPage({ params }: MeetingPageProps) {
  const { id } = use(params)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 w-full">
        <MeetingWorkspace roomId={id} />
      </div>
    </AuthGuard>
  )
}
