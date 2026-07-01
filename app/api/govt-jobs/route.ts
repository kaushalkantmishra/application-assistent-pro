import { NextResponse } from "next/server"
import { JobRepository } from "@/repositories/job.repository"

export async function GET() {
  try {
    const jobs = await JobRepository.findAllGovt()
    const responseData = jobs.map((job) => ({
      ...job,
      _id: job.id, // For backward compatibility
    }))
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Fetch govt jobs API error:", error)
    return NextResponse.json({ error: "Failed to fetch government jobs" }, { status: 500 })
  }
}
