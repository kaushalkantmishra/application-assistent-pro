import { NextRequest, NextResponse } from "next/server"
import { JobRepository } from "@/repositories/job.repository"
import { z } from "zod"

const CreateCorporateJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  salary: z.string().optional().nullable(),
  postedDate: z.string().transform((val) => new Date(val)).optional().nullable(),
  deadline: z.string().transform((val) => new Date(val)).optional().nullable(),
  description: z.string().optional().nullable(),
  requirements: z.array(z.string()).optional().nullable(),
  status: z.string().default("active"),
})

export async function GET() {
  try {
    const jobs = await JobRepository.findAllCorporate()
    const responseData = jobs.map((job) => ({
      ...job,
      _id: job.id, // For backward compatibility
    }))
    return NextResponse.json(responseData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CreateCorporateJobSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 })
    }

    const job = await JobRepository.createCorporate({
      title: parsed.data.title,
      company: parsed.data.company,
      location: parsed.data.location || null,
      type: parsed.data.type || null,
      salary: parsed.data.salary || null,
      postedDate: parsed.data.postedDate || null,
      deadline: parsed.data.deadline || null,
      description: parsed.data.description || null,
      requirements: parsed.data.requirements || [],
      status: parsed.data.status,
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error("Create job API error:", error)
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}