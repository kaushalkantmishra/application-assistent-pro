import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { videoMeetings, meetingParticipants } from "@/db/schema"
import { UserRepository } from "@/repositories/user.repository"
import { eq, and } from "drizzle-orm"

async function getUserIdOrFallback() {
  const session = await auth()
  let userId = session?.user?.id
  if (!userId) {
    let testUser = await UserRepository.findByEmail("test@example.com")
    if (!testUser) {
      testUser = await UserRepository.create({
        email: "test@example.com",
        name: "Test User",
        role: "job_seeker",
      })
    }
    userId = testUser.id
  }
  return userId;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId")

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    const meeting = await db
      .select()
      .from(videoMeetings)
      .where(eq(videoMeetings.bookingId, bookingId))
      .then(res => res[0])

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not started or created yet" }, { status: 404 })
    }

    return NextResponse.json(meeting)
  } catch (error: any) {
    console.error("GET Video Meeting Error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch meeting info" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback()
    const body = await request.json()
    const { bookingId, provider } = body

    if (!bookingId || !provider) {
      return NextResponse.json({ error: "Missing required details" }, { status: 400 })
    }

    const roomName = `room-${Math.random().toString(36).substring(2, 7)}`
    const meetingLink = `https://meet.google.com/${roomName}`

    // Insert meeting entry
    const [meeting] = await db
      .insert(videoMeetings)
      .values({
        bookingId,
        provider, // e.g. "Google Meet"
        meetingLink,
        roomName,
        status: "active",
      })
      .returning()

    // Add participant
    await db.insert(meetingParticipants).values({
      meetingId: meeting.id,
      userId,
    })

    return NextResponse.json(meeting)
  } catch (error: any) {
    console.error("POST Video Meeting Error:", error)
    return NextResponse.json({ error: error.message || "Failed to create meeting" }, { status: 500 })
  }
}
