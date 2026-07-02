import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { videoRooms, meetingPermissions, interviewBookings } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { roomId, action, targetUserId } = await request.json()
    if (!roomId || !action) {
      return NextResponse.json({ error: "Room ID and Action are required" }, { status: 400 })
    }

    // Load room
    const room = await db
      .select()
      .from(videoRooms)
      .where(eq(videoRooms.id, roomId))
      .then(r => r[0])

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    // Ensure the current user is the host
    if (session.user.id !== room.hostId) {
      return NextResponse.json({ error: "Only the interviewer host can trigger this action" }, { status: 403 })
    }

    if (action === "end") {
      // Set room status to ended
      await db
        .update(videoRooms)
        .set({ status: "ended" })
        .where(eq(videoRooms.id, roomId))

      return NextResponse.json({ success: true, message: "Room ended" })
    }

    if (action === "mute" && targetUserId) {
      // Mute/unmute remote target user
      const existing = await db
        .select()
        .from(meetingPermissions)
        .where(and(eq(meetingPermissions.roomId, roomId), eq(meetingPermissions.userId, targetUserId)))
        .then(r => r[0])

      if (existing) {
        await db
          .update(meetingPermissions)
          .set({ isMutedByHost: !existing.isMutedByHost, updatedAt: new Date() })
          .where(eq(meetingPermissions.id, existing.id))
      } else {
        await db.insert(meetingPermissions).values({
          roomId,
          userId: targetUserId,
          isMutedByHost: true,
          allowScreenShare: true,
        })
      }
      return NextResponse.json({ success: true, message: "Target user mute status toggled" })
    }

    if (action === "screen-share-permission" && targetUserId) {
      // Toggle screen share permission
      const existing = await db
        .select()
        .from(meetingPermissions)
        .where(and(eq(meetingPermissions.roomId, roomId), eq(meetingPermissions.userId, targetUserId)))
        .then(r => r[0])

      if (existing) {
        await db
          .update(meetingPermissions)
          .set({ allowScreenShare: !existing.allowScreenShare, updatedAt: new Date() })
          .where(eq(meetingPermissions.id, existing.id))
      } else {
        await db.insert(meetingPermissions).values({
          roomId,
          userId: targetUserId,
          isMutedByHost: false,
          allowScreenShare: false,
        })
      }
      return NextResponse.json({ success: true, message: "Target screen share permission updated" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.error("Meeting action error:", error)
    return NextResponse.json({ error: error.message || "Failed to process meeting action" }, { status: 500 })
  }
}
