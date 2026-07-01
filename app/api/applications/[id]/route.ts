import { NextRequest, NextResponse } from "next/server"
import { ApplicationRepository } from "@/repositories/application.repository"
import { z } from "zod"

const UpdateApplicationSchema = z.object({
  company: z.string().min(1, "Company is required").optional(),
  role: z.string().min(1, "Role is required").optional(),
  status: z.string().optional(),
  appliedDate: z.string().transform((val) => new Date(val)).optional(),
  deadline: z.string().transform((val) => new Date(val)).optional().nullable(),
  location: z.string().optional().nullable(),
  salary: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = UpdateApplicationSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 })
    }

    const application = await ApplicationRepository.update(id, parsed.data)
    
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Update application API error:", error)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const application = await ApplicationRepository.delete(id)
    
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Application deleted successfully" })
  } catch (error) {
    console.error("Delete application API error:", error)
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 })
  }
}
