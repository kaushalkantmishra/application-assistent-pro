import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { interviewFeedback, interviewBookings, interviewNotifications, bookingHistory } from "@/db/schema"
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

    const [fb] = await db
      .select()
      .from(interviewFeedback)
      .where(eq(interviewFeedback.bookingId, bookingId))

    if (!fb) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    return NextResponse.json(fb)
  } catch (error: any) {
    console.error("GET Feedback Error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch feedback" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      bookingId,
      overallRating,
      technicalRating,
      communication,
      problemSolving,
      confidence,
      behavior,
      codingSkills,
      strengths,
      weaknesses,
      recommendations,
      hiringRecommendation,
      notes,
    } = body

    if (!bookingId || overallRating === undefined || technicalRating === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch booking details
    const [booking] = await db
      .select()
      .from(interviewBookings)
      .where(eq(interviewBookings.id, bookingId))

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Save feedback
    const [fb] = await db
      .insert(interviewFeedback)
      .values({
        bookingId,
        interviewerId: booking.interviewerId,
        candidateId: booking.candidateId,
        overallRating,
        technicalRating,
        communication,
        problemSolving,
        confidence,
        behavior,
        codingSkills,
        strengths,
        weaknesses,
        recommendations,
        hiringRecommendation,
        notes: notes || null,
      })
      .returning()

    // Mark booking status as Completed
    await db
      .update(interviewBookings)
      .set({
        status: "Completed",
        updatedAt: new Date(),
      })
      .where(eq(interviewBookings.id, bookingId))

    // Log history
    await db.insert(bookingHistory).values({
      bookingId,
      action: "completed",
      actorId: booking.candidateId,
      notes: "Feedback submitted and session completed",
    })

    // Notify candidate
    await db.insert(interviewNotifications).values({
      userId: booking.candidateId,
      type: "feedback",
      title: "Interview Feedback Available",
      message: `Your feedback report for ${booking.interviewType} is ready to view.`,
      link: `/feedback/${bookingId}`,
    })

    return NextResponse.json(fb)
  } catch (error: any) {
    console.error("POST Feedback Error:", error)
    return NextResponse.json({ error: error.message || "Failed to submit feedback" }, { status: 500 })
  }
}
