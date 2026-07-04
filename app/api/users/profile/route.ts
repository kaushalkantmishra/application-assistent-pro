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

  about: z.string().optional().nullable(),
  currentDesignation: z.string().optional().nullable(),
  yearsOfExperience: z.number().optional().nullable(),
  currentCompany: z.string().optional().nullable(),
  currentSalary: z.string().optional().nullable(),
  expectedSalary: z.string().optional().nullable(),
  preferredIndustry: z.string().optional().nullable(),
  preferredWorkMode: z.string().optional().nullable(),
  languages: z.array(z.string()).optional().nullable(),

  // Social Links
  github: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  portfolio: z.string().optional().nullable(),
  leetcode: z.string().optional().nullable(),
  geeksforgeeks: z.string().optional().nullable(),
  codechef: z.string().optional().nullable(),
  codeforces: z.string().optional().nullable(),
  hackerrank: z.string().optional().nullable(),
  hackerearth: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
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

      about: parsed.data.about,
      currentDesignation: parsed.data.currentDesignation,
      yearsOfExperience: parsed.data.yearsOfExperience,
      currentCompany: parsed.data.currentCompany,
      currentSalary: parsed.data.currentSalary,
      expectedSalary: parsed.data.expectedSalary,
      preferredIndustry: parsed.data.preferredIndustry,
      preferredWorkMode: parsed.data.preferredWorkMode,
      languages: parsed.data.languages,

      github: parsed.data.github,
      linkedin: parsed.data.linkedin,
      portfolio: parsed.data.portfolio,
      leetcode: parsed.data.leetcode,
      geeksforgeeks: parsed.data.geeksforgeeks,
      codechef: parsed.data.codechef,
      codeforces: parsed.data.codeforces,
      hackerrank: parsed.data.hackerrank,
      hackerearth: parsed.data.hackerearth,
      website: parsed.data.website,
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Update user profile API error:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}
