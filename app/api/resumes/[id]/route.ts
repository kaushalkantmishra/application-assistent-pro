import { NextRequest, NextResponse } from "next/server"
import { ResumeRepository } from "@/repositories/resume.repository"
import { z } from "zod"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

const UpdateMetadataSchema = z.object({
  title: z.string().optional(),
  templateId: z.string().optional(),
  themeId: z.string().optional(),
  status: z.string().optional(),
})

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const resume = await ResumeRepository.findById(id)
    
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    return NextResponse.json(resume)
  } catch (error) {
    console.error("Get resume API error:", error)
    return NextResponse.json({ error: "Failed to fetch resume" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const parsed = UpdateMetadataSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 })
    }

    const updated = await ResumeRepository.update(id, parsed.data)
    if (!updated) {
      return NextResponse.json({ error: "Resume not found or failed to update" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update resume API error:", error)
    return NextResponse.json({ error: "Failed to update resume" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const deleted = await ResumeRepository.delete(id)
    
    if (!deleted) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Resume deleted successfully" })
  } catch (error) {
    console.error("Delete resume API error:", error)
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 })
  }
}
