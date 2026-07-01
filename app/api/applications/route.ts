import { NextRequest, NextResponse } from "next/server"
import { ApplicationRepository } from "@/repositories/application.repository"
import { z } from "zod"

const CreateApplicationSchema = z.object({
  userId: z.string().optional(),
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  status: z.string().default("Applied"),
  appliedDate: z.string().transform((val) => new Date(val)).default(() => new Date().toISOString()),
  deadline: z.string().transform((val) => new Date(val)).optional().nullable(),
  location: z.string().optional().nullable(),
  salary: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function GET() {
  try {
    const apps = await ApplicationRepository.findAll()
    // Map id to string if needed to match MongoDB's _id
    const responseData = apps.map((app) => ({
      ...app,
      _id: app.id, // For backward compatibility
    }))
    return NextResponse.json(responseData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CreateApplicationSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 })
    }

    const application = await ApplicationRepository.create({
      userId: parsed.data.userId || null,
      company: parsed.data.company,
      role: parsed.data.role,
      status: parsed.data.status,
      appliedDate: parsed.data.appliedDate,
      deadline: parsed.data.deadline || null,
      location: parsed.data.location || null,
      salary: parsed.data.salary || null,
      notes: parsed.data.notes || null,
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error("Create application API error:", error)
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 })
  }
}