import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { interviewBookings, interviewers, users, bookingHistory, calendarEvents, interviewNotifications } from "@/db/schema"
import { UserRepository } from "@/repositories/user.repository"
import { eq, and, desc } from "drizzle-orm"

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

export async function GET(request: NextRequest) {
  try {
    const { userId, role } = await getUserInfoOrFallback()

    if (role === "interviewer") {
      // Find interviewer profile first
      const profile = await db.select().from(interviewers).where(eq(interviewers.userId, userId)).then(r => r[0])
      if (!profile) {
        return NextResponse.json([])
      }

      // Fetch bookings with candidate info joined
      const list = await db
        .select({
          booking: interviewBookings,
          candidateName: users.name,
          candidateEmail: users.email,
        })
        .from(interviewBookings)
        .leftJoin(users, eq(interviewBookings.candidateId, users.id))
        .where(eq(interviewBookings.interviewerId, profile.id))
        .orderBy(desc(interviewBookings.scheduledDate))

      return NextResponse.json(list.map(item => ({
        ...item.booking,
        candidateName: item.candidateName || "Candidate",
        candidateEmail: item.candidateEmail || "",
      })))
    } else {
      // Job seeker role
      const list = await db
        .select({
          booking: interviewBookings,
          interviewerName: interviewers.name,
          company: interviewers.company,
          role: interviewers.role,
        })
        .from(interviewBookings)
        .leftJoin(interviewers, eq(interviewBookings.interviewerId, interviewers.id))
        .where(eq(interviewBookings.candidateId, userId))
        .orderBy(desc(interviewBookings.scheduledDate))

      return NextResponse.json(list.map(item => ({
        ...item.booking,
        interviewerName: item.interviewerName || "Interviewer",
        company: item.company || "",
        designation: item.role || "",
      })))
    }
  } catch (error: any) {
    console.error("GET Bookings Error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getUserInfoOrFallback()
    const body = await request.json()
    const { interviewerId, interviewType, scheduledDate, duration, notes } = body

    if (!interviewerId || !interviewType || !scheduledDate || !duration) {
      return NextResponse.json({ error: "Missing required booking details" }, { status: 400 })
    }

    // Insert booking
    const [booking] = await db
      .insert(interviewBookings)
      .values({
        interviewerId,
        candidateId: userId,
        interviewType,
        scheduledDate: new Date(scheduledDate),
        duration: parseInt(duration),
        status: "Pending",
        notes: notes || null,
        meetingLink: `https://meet.google.com/mock-meet-${Math.random().toString(36).substring(2, 7)}`,
      })
      .returning()

    // Log history
    await db.insert(bookingHistory).values({
      bookingId: booking.id,
      action: "create",
      actorId: userId,
      notes: "Booking requested by candidate",
    })

    // Fetch interviewer user ID to send notification
    const interviewerProfile = await db
      .select()
      .from(interviewers)
      .where(eq(interviewers.id, interviewerId))
      .then(r => r[0])

    if (interviewerProfile && interviewerProfile.userId) {
      await db.insert(interviewNotifications).values({
        userId: interviewerProfile.userId,
        type: "booking_request",
        title: "New Booking Request",
        message: `You have a new mock interview request for ${interviewType}.`,
        link: `/interviewer/bookings`,
      })
    }

    return NextResponse.json(booking)
  } catch (error: any) {
    console.error("POST Booking Error:", error)
    return NextResponse.json({ error: error.message || "Failed to create booking" }, { status: 500 })
  }
}
