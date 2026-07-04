"use client"

import { AppLayout } from "@/components/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { RoleGuard } from "@/components/role-guard"
import ChatLobby from "@/components/pages/ai/chat-lobby"
import { useSearchParams } from "next/navigation"

export default function Page() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get("roomId") || undefined

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["user", "interviewer"]} fallbackMessage="Please log in first.">
        <AppLayout>
          <ChatLobby initialRoomId={roomId} />
        </AppLayout>
      </RoleGuard>
    </AuthGuard>
  )
}
