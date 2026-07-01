import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { UserRepository } from "@/repositories/user.repository"
import { ResumeRepository } from "@/repositories/resume.repository"
import { getInitialResumeJson } from "@/lib/resume-schemas"
import { z } from "zod"

const CreateResumeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  templateId: z.string().default("classic"),
  themeId: z.string().default("default"),
})

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
  
  return userId
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback()
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get("search") || undefined
    const isFavorite = searchParams.get("isFavorite") === "true" ? true : undefined
    const templateId = searchParams.get("templateId") || undefined
    const sortBy = (searchParams.get("sortBy") as "updatedAt" | "title" | "createdAt") || undefined
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || undefined

    const list = await ResumeRepository.findAll(userId, {
      search,
      isFavorite,
      templateId,
      sortBy,
      sortOrder,
    })

    return NextResponse.json(list)
  } catch (error) {
    console.error("List resumes API error:", error)
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback()
    const body = await request.json()
    
    const parsed = CreateResumeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 })
    }

    const initialJson = getInitialResumeJson()
    // Pre-populate with user details if available
    const session = await auth()
    if (session?.user) {
      initialJson.personalInfo.fullName = session.user.name || ""
      initialJson.personalInfo.email = session.user.email || ""
    } else {
      initialJson.personalInfo.fullName = "Test User"
      initialJson.personalInfo.email = "test@example.com"
    }

    const newResume = await ResumeRepository.create(userId, {
      title: parsed.data.title,
      templateId: parsed.data.templateId,
      themeId: parsed.data.themeId,
      resumeJson: initialJson,
      status: "draft",
    })

    return NextResponse.json(newResume, { status: 201 })
  } catch (error) {
    console.error("Create resume API error:", error)
    return NextResponse.json({ error: "Failed to create resume" }, { status: 500 })
  }
}
