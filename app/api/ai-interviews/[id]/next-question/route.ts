import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { aiInterviewQuestions, aiInterviewAnswers } from "@/db/schema"
import { eq, notInArray } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params

    // 1. Fetch all questions for this session
    const allQuestions = await db
      .select()
      .from(aiInterviewQuestions)
      .where(eq(aiInterviewQuestions.sessionId, sessionId))

    // 2. Fetch all answered question IDs
    const answered = await db
      .select({ questionId: aiInterviewAnswers.questionId })
      .from(aiInterviewAnswers)
      .innerJoin(aiInterviewQuestions, eq(aiInterviewAnswers.questionId, aiInterviewQuestions.id))
      .where(eq(aiInterviewQuestions.sessionId, sessionId))
    
    const answeredIds = answered.map(a => a.questionId)

    // 3. Find the first unanswered question
    const unanswered = allQuestions.find(q => !answeredIds.includes(q.id))

    if (!unanswered) {
      // No more questions -> return 204 or null
      return new NextResponse(null, { status: 204 })
    }

    return NextResponse.json(unanswered)
  } catch (error: any) {
    console.error("GET Next Question Error:", error)
    return NextResponse.json({ error: error.message || "Failed to load next question" }, { status: 500 })
  }
}
