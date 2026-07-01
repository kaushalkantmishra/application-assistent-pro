import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { UserRepository } from "@/repositories/user.repository"
import { z } from "zod"

const UpdateProfileSchema = z.object({
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  skills: z.array(z.string()).optional().nullable(),
  preferredRoles: z.array(z.string()).optional().nullable(),
  preferredCompanies: z.array(z.string()).optional().nullable(),
  preferredLocations: z.array(z.string()).optional().nullable(),
  resumeFileName: z.string().optional().nullable(),
})

export async function GET() {
  try {
    const session = await auth()
    
    // If not authenticated, use a fallback test user to allow previewing/testing
    let userId = session?.user?.id
    if (!userId) {
      // Find or create test user
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

    const profile = await UserRepository.getProfileByUserId(userId)
    if (!profile) {
      // Create empty profile if not exists
      const newProfile = await UserRepository.upsertProfile(userId, {
        phone: "+1 555-0199",
        location: "San Francisco, CA",
        education: "B.S. in Computer Science",
        experience: "3 years as Frontend Developer",
        skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
        preferredRoles: ["Software Engineer", "Frontend Developer"],
        preferredCompanies: ["Stripe", "Vercel", "Google"],
        preferredLocations: ["San Francisco, CA", "Remote"],
      })
      return NextResponse.json({ ...newProfile, name: session?.user?.name || "Test User", email: session?.user?.email || "test@example.com" })
    }

    return NextResponse.json({
      ...profile,
      name: session?.user?.name || "Test User",
      email: session?.user?.email || "test@example.com",
    })
  } catch (error) {
    console.error("Fetch user profile API error:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const parsed = UpdateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 })
    }

    const updatedProfile = await UserRepository.upsertProfile(userId, {
      phone: parsed.data.phone,
      location: parsed.data.location,
      education: parsed.data.education,
      experience: parsed.data.experience,
      skills: parsed.data.skills,
      preferredRoles: parsed.data.preferredRoles,
      preferredCompanies: parsed.data.preferredCompanies,
      preferredLocations: parsed.data.preferredLocations,
      resumeFileName: parsed.data.resumeFileName,
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Update user profile API error:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}
