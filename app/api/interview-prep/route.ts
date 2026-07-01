import { NextResponse } from "next/server"
import { db } from "@/db"
import { interviewQuestions } from "@/db/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    const questions = await db
      .select()
      .from(interviewQuestions)
      .orderBy(desc(interviewQuestions.createdAt))
      
    const responseData = questions.map((q) => ({
      ...q,
      _id: q.id, // For backward compatibility
    }))
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Fetch interview questions API error:", error)
    return NextResponse.json({ error: "Failed to fetch interview questions" }, { status: 500 })
  }
}
