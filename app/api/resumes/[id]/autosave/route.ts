import { NextRequest, NextResponse } from "next/server"
import { ResumeRepository } from "@/repositories/resume.repository"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    
    if (!body.resumeJson) {
      return NextResponse.json({ error: "Missing resumeJson payload" }, { status: 400 })
    }

    const updated = await ResumeRepository.updateJson(id, body.resumeJson)
    if (!updated) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, updatedAt: updated.updatedAt })
  } catch (error) {
    console.error("Autosave API error:", error)
    return NextResponse.json({ error: "Failed to autosave resume" }, { status: 500 })
  }
}
