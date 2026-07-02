import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { interviewBookings, bookingHistory, calendarEvents, interviewNotifications, interviewers } from "@/db/schema"
import { UserRepository } from "@/repositories/user.repository"
import { eq, and } from "drizzle-orm"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

async function getUserInfoOrFallback() {
  const session = await auth()
  let userId = session?.user?.id
  let email = session?.user?.email || "test@example.com"
  let role = session?.user?.role || "job_seeker"

  if (!userId) {
    let testUser = await UserRepository.findByEmail(email)
    if (!testUser) {
      testUser = await UserRepository.create({
        email,
        name: session?.user?.name || "Test User",
        role: "job_seeker",
      })
    }
    userId = testUser.id
    role = testUser.role || "job_seeker"
  }
  return { userId, role }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: bookingId } = await params
    const { userId, role } = await getUserInfoOrFallback()
    const body = await request.json()
    const { status, notes } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const [booking] = await db
      .select()
      .from(interviewBookings)
      .where(eq(interviewBookings.id, bookingId))

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Update status
    const [updated] = await db
      .update(interviewBookings)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(interviewBookings.id, bookingId))
      .returning()

    // Add status history entry
    await db.insert(bookingHistory).values({
      bookingId,
      action: status.toLowerCase(),
      actorId: userId,
      notes: notes || `Booking status updated to ${status}`,
    })

    // If Accepted, create calendar events for candidate & interviewer
    if (status === "Accepted") {
      const durationMs = booking.duration * 60 * 1000
      const end = new Date(booking.scheduledDate.getTime() + durationMs)

      // Create Calendar event for candidate
      await db.insert(calendarEvents).values({
        userId: booking.candidateId,
        title: `Mock Interview: ${booking.interviewType}`,
        description: `Mock Interview Session. Duration: ${booking.duration} mins.`,
        start: booking.scheduledDate,
        end,
        link: booking.meetingLink,
      })

      // Fetch interviewer's user id to log event for them too
      const interviewer = await db
        .select()
        .from(interviewers)
        .where(eq(interviewers.id, booking.interviewerId))
        .then(r => r[0])

      if (interviewer && interviewer.userId) {
        await db.insert(calendarEvents).values({
          userId: interviewer.userId,
          title: `Interviewer Session: ${booking.interviewType}`,
          description: `Mock Interview Session. Duration: ${booking.duration} mins.`,
          start: booking.scheduledDate,
          end,
          link: booking.meetingLink,
        })

        // Notify candidate
        await db.insert(interviewNotifications).values({
          userId: booking.candidateId,
          type: "accepted",
          title: "Booking Accepted",
          message: `Your booking request for ${booking.interviewType} has been accepted.`,
          link: `/resumes`, // or dashboard
        })
      }
    } else if (status === "Rejected" || status === "Cancelled") {
      // Notify candidate/interviewer depending on actor
      const targetUserId = role === "interviewer" ? booking.candidateId : null
      if (targetUserId) {
        await db.insert(interviewNotifications).values({
          userId: targetUserId,
          type: "rejected",
          title: `Booking ${status}`,
          message: `Your booking request for ${booking.interviewType} was ${status.toLowerCase()}.`,
          link: `/resumes`,
        })
      }
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("POST Booking Status Error:", error)
    return NextResponse.json({ error: error.message || "Failed to update status" }, { status: 500 })
  }
}
