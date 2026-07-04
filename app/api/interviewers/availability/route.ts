import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { interviewers, interviewerAvailability, availabilitySlots } from "@/db/schema"
import { UserRepository } from "@/repositories/user.repository"
import { eq, and } from "drizzle-orm"

async function getInterviewerIdOrFallback() {
  const session = await auth()
  let userId = session?.user?.id

  if (!userId) {
    let testUser = await UserRepository.findByEmail("test-interviewer@example.com")
    if (!testUser) {
      testUser = await UserRepository.create({
        email: "test-interviewer@example.com",
        name: "Sarah Jenkins",
        role: "interviewer",
      })
    }
    userId = testUser.id
  }

  // Get profile
  let profile = await db.select().from(interviewers).where(eq(interviewers.userId, userId)).then((r) => r[0])
  if (!profile) {
    // Create default profile
    const [inserted] = await db.insert(interviewers).values({
      userId,
      name: session?.user?.name || "Sarah Jenkins",
      email: session?.user?.email || "test-interviewer@example.com",
      company: "Stripe",
      role: "Tech Lead",
      pricingType: "free",
      hourlyCharges: 0,
      verificationStatus: "verified",
      isActive: true,
    }).returning()
    profile = inserted
  }
  return profile.id
}

export async function GET(request: NextRequest) {
  try {
    const interviewerId = await getInterviewerIdOrFallback()
    const { searchParams } = new URL(request.url)
    const view = searchParams.get("view") || "recurring" // "recurring" or "slots"

    if (view === "slots") {
      const slots = await db
        .select()
        .from(availabilitySlots)
        .where(eq(availabilitySlots.interviewerId, interviewerId))
      return NextResponse.json(slots)
    }

    const recurring = await db
      .select()
      .from(interviewerAvailability)
      .where(eq(interviewerAvailability.interviewerId, interviewerId))
    return NextResponse.json(recurring)
  } catch (error: any) {
    console.error("GET Availability Error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch availability" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const interviewerId = await getInterviewerIdOrFallback()
    const body = await request.json()
    const { slots, recurring } = body;

    // Save recurring templates
    if (recurring && Array.isArray(recurring)) {
      // Clear existing recurring first
      await db.delete(interviewerAvailability).where(eq(interviewerAvailability.interviewerId, interviewerId))

      if (recurring.length > 0) {
        await db.insert(interviewerAvailability).values(
          recurring.map((item: any) => ({
            interviewerId,
            dayOfWeek: item.dayOfWeek,
            startTime: item.startTime,
            endTime: item.endTime,
            isRecurring: true,
          }))
        )
      }
    }

    // Save custom slots
    if (slots && Array.isArray(slots)) {
      // Clear all future custom slots first
      await db.delete(availabilitySlots).where(eq(availabilitySlots.interviewerId, interviewerId))

      if (slots.length > 0) {
        await db.insert(availabilitySlots).values(
          slots.map((item: any) => ({
            interviewerId,
            date: new Date(item.date),
            startTime: item.startTime,
            endTime: item.endTime,
            status: item.status || "available",
          }))
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("POST Availability Error:", error)
    return NextResponse.json({ error: error.message || "Failed to update availability" }, { status: 500 })
  }
}
