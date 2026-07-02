import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { videoRooms, interviewBookings } from "@/db/schema"
import { eq, or } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { roomId } = await request.json()
    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 })
    }

    // 1. Fetch Room & Booking details
    const room = await db
      .select()
      .from(videoRooms)
      .where(or(eq(videoRooms.id, roomId), eq(videoRooms.bookingId, roomId)))
      .then(r => r[0])

    if (!room) {
      return NextResponse.json({ error: "Video room not found" }, { status: 404 })
    }

    const booking = await db
      .select()
      .from(interviewBookings)
      .where(eq(interviewBookings.id, room.bookingId))
      .then(r => r[0])

    if (!booking) {
      return NextResponse.json({ error: "Associated booking not found" }, { status: 404 })
    }

    const currentUserId = session.user.id
    const isInterviewer = currentUserId === booking.interviewerId
    const isCandidate = currentUserId === booking.candidateId

    if (!isInterviewer && !isCandidate) {
      return NextResponse.json({ error: "You are not authorized to join this interview room" }, { status: 403 })
    }

    // 2. Generate a secure Mock/Simulated Token representing user details and role permissions
    const payload = {
      roomId: room.id,
      userId: currentUserId,
      name: session.user.name || "Participant",
      role: isInterviewer ? "host" : "candidate",
      email: session.user.email,
      provider: room.provider,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2 hours
    }

    const secureToken = Buffer.from(JSON.stringify(payload)).toString("base64")

    return NextResponse.json({
      token: secureToken,
      payload,
    })
  } catch (error: any) {
    console.error("Token generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate session token" }, { status: 500 })
  }
}
