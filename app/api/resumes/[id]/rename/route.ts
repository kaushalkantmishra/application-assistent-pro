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
    
    if (!body.title || body.title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const updated = await ResumeRepository.rename(id, body.title.trim())
    if (!updated) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Rename API error:", error)
    return NextResponse.json({ error: "Failed to rename resume" }, { status: 500 })
  }
}
