import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { interviewers, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

const UpdateInterviewerProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  experience: z.number().optional().nullable(),
  specializations: z.array(z.string()).optional().nullable(),
  bio: z.string().optional().nullable(),
  linkedIn: z.string().optional().nullable(),
  github: z.string().optional().nullable(),
  availability: z.any().optional().nullable(),
  interviewTypes: z.array(z.string()).optional().nullable(),
  
  portfolio: z.string().optional().nullable(),
  pricingType: z.string().optional().nullable(),
  hourlyCharges: z.number().optional().nullable(),
  languages: z.array(z.string()).optional().nullable(),
  interviewCategories: z.array(z.string()).optional().nullable(),
})

export async function GET() {
  try {
    const session = await auth()
    
    // Find or create test user if not authenticated
    let userId = session?.user?.id
    let email = session?.user?.email || "test-interviewer@example.com"
    let name = session?.user?.name || "Sarah Jenkins"

    if (!userId) {
      const { UserRepository } = await import("@/repositories/user.repository")
      let testUser = await UserRepository.findByEmail(email)
      if (!testUser) {
        testUser = await UserRepository.create({
          email,
          name,
          role: "interviewer",
        })
      }
      userId = testUser.id
    }

    // Find interviewer profile
    let profile = await db.select().from(interviewers).where(eq(interviewers.userId, userId)).then((r) => r[0])

    if (!profile) {
      // Create empty profile or copy Sarah Jenkins' profile for the test user
      const result = await db.insert(interviewers).values({
        userId,
        name,
        email,
        company: "Stripe",
        role: "Tech Lead",
        department: "Billing Infrastructure",
        experience: 9,
        specializations: ["React", "TypeScript", "Frontend Architecture", "API Design"],
        bio: "Passionate about web performance, clean API designs, and building rich interactive dashboards.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        rating: 4.8,
        totalInterviews: 85,
        availability: {
          days: ["Tuesday", "Thursday"],
          timeSlots: ["1:00 PM - 3:00 PM", "4:00 PM - 6:00 PM"],
        },
        interviewTypes: ["Frontend Technical", "React Deep-dive", "Behavioral / Leadership"],
        linkedIn: "https://linkedin.com/in/sarah-jenkins-stripe",
        github: "https://github.com/sjenkins-dev",
        isActive: true,
      }).returning()
      profile = result[0]
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Fetch interviewer profile API error:", error)
    return NextResponse.json({ error: "Failed to fetch interviewer profile" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    let userId = session?.user?.id
    let email = session?.user?.email || "test-interviewer@example.com"
    let name = session?.user?.name || "Sarah Jenkins"

    if (!userId) {
      const { UserRepository } = await import("@/repositories/user.repository")
      let testUser = await UserRepository.findByEmail(email)
      if (!testUser) {
        testUser = await UserRepository.create({
          email,
          name,
          role: "interviewer",
        })
      }
      userId = testUser.id
    }

    const body = await request.json()
    const parsed = UpdateInterviewerProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 })
    }

    // Check if profile exists
    const existing = await db.select().from(interviewers).where(eq(interviewers.userId, userId)).then((r) => r[0])

    const updateData = {
      name: parsed.data.name,
      company: parsed.data.company ?? null,
      role: parsed.data.role ?? null,
      department: parsed.data.department ?? null,
      experience: parsed.data.experience ?? null,
      specializations: parsed.data.specializations ?? null,
      bio: parsed.data.bio ?? null,
      linkedIn: parsed.data.linkedIn ?? null,
      github: parsed.data.github ?? null,
      availability: parsed.data.availability ?? null,
      interviewTypes: parsed.data.interviewTypes ?? null,
      portfolio: parsed.data.portfolio ?? null,
      pricingType: parsed.data.pricingType || "free",
      hourlyCharges: parsed.data.hourlyCharges || 0,
      languages: parsed.data.languages ?? null,
      interviewCategories: parsed.data.interviewCategories ?? null,
      updatedAt: new Date(),
    }

    let profile
    if (existing) {
      const result = await db.update(interviewers).set(updateData).where(eq(interviewers.userId, userId)).returning()
      profile = result[0]
    } else {
      const result = await db.insert(interviewers).values({
        userId,
        email,
        ...updateData,
      }).returning()
      profile = result[0]
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Save interviewer profile API error:", error)
    return NextResponse.json({ error: "Failed to save interviewer profile" }, { status: 500 })
  }
}
