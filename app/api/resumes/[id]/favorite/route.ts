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
    const updated = await ResumeRepository.toggleFavorite(id)
    
    if (!updated) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Toggle favorite API error:", error)
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 })
  }
}
