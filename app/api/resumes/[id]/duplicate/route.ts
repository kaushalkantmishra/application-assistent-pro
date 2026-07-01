import { NextRequest, NextResponse } from "next/server"
import { ResumeRepository } from "@/repositories/resume.repository"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const duplicated = await ResumeRepository.duplicate(id)
    
    if (!duplicated) {
      return NextResponse.json({ error: "Failed to duplicate resume (not found)" }, { status: 404 })
    }

    return NextResponse.json(duplicated, { status: 201 })
  } catch (error) {
    console.error("Duplicate API error:", error)
    return NextResponse.json({ error: "Failed to duplicate resume" }, { status: 500 })
  }
}
