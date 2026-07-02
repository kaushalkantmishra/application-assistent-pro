import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { aiInterviewReports } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params

    const report = await db
      .select()
      .from(aiInterviewReports)
      .where(eq(aiInterviewReports.sessionId, sessionId))
      .then(r => r[0])

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    return NextResponse.json(report)
  } catch (error: any) {
    console.error("GET Report Card Error:", error)
    return NextResponse.json({ error: error.message || "Failed to retrieve report card" }, { status: 500 })
  }
}
