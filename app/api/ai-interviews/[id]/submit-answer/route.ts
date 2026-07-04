import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import {
  aiInterviewQuestions,
  aiInterviewAnswers,
  aiInterviewSessions,
  aiInterviewReports
} from "@/db/schema"
import { eq } from "drizzle-orm"
import { callGemini } from "@/services/ai/gemini"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const { questionId, answerText } = await request.json()

    // 1. Fetch the question details
    const question = await db
      .select()
      .from(aiInterviewQuestions)
      .where(eq(aiInterviewQuestions.id, questionId))
      .then(r => r[0])

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // 2. Call Gemini Flash to evaluate this single answer response
    const evaluationPrompt = `
      You are an expert technical interviewer evaluating a candidate's answer.
      - Question: ${question.questionText}
      - Expected Answer checklist: ${question.expectedAnswer || "Not specified"}
      - Candidate Answer: ${answerText}

      Evaluate the candidate's answer and return a JSON object with the following keys:
      - "correctnessScore": Integer between 0 and 100 rating accuracy.
      - "confidenceScore": Integer between 0 and 100 rating candidate assurance.
      - "communicationScore": Integer between 0 and 100 rating structure.
      - "technicalScore": Integer between 0 and 100 rating depth of technology.
      - "feedback": A brief description of what was good, what was wrong, and what was missing.
      - "hints": A helpful recommendation or tip to improve the answer.

      Do NOT wrap response in markdown blocks like \`\`\`json. Return pure JSON.
    `

    const systemPrompt = "You are a professional assessor that rates mock interview answers in clean JSON formats."
    const geminiEval = await callGemini(evaluationPrompt, systemPrompt, true)
    const evalData = JSON.parse(geminiEval)

    // 3. Save the answer evaluation record
    const [newAnswer] = await db
      .insert(aiInterviewAnswers)
      .values({
        questionId,
        answerText,
        correctnessScore: evalData.correctnessScore || 50,
        confidenceScore: evalData.confidenceScore || 50,
        communicationScore: evalData.communicationScore || 50,
        technicalScore: evalData.technicalScore || 50,
        feedback: evalData.feedback || "",
        hints: evalData.hints || "",
      })
      .returning()

    // 4. Check if there are any remaining unanswered questions
    const allQuestions = await db
      .select()
      .from(aiInterviewQuestions)
      .where(eq(aiInterviewQuestions.sessionId, sessionId))

    const answeredList = await db
      .select({ questionId: aiInterviewAnswers.questionId })
      .from(aiInterviewAnswers)
      .innerJoin(aiInterviewQuestions, eq(aiInterviewAnswers.questionId, aiInterviewQuestions.id))
      .where(eq(aiInterviewQuestions.sessionId, sessionId))
    
    const answeredIds = answeredList.map(a => a.questionId)
    const hasMore = allQuestions.some(q => !answeredIds.includes(q.id))

    if (!hasMore) {
      // 5. Generate a comprehensive scorecard report card
      // Fetch all answers to calculate average scores
      const allAnswers = await db
        .select()
        .from(aiInterviewAnswers)
        .innerJoin(aiInterviewQuestions, eq(aiInterviewAnswers.questionId, aiInterviewQuestions.id))
        .where(eq(aiInterviewQuestions.sessionId, sessionId))

      const avgCorrectness = Math.round(allAnswers.reduce((sum, curr) => sum + curr.ai_interview_answers.correctnessScore, 0) / allAnswers.length)
      const avgCommunication = Math.round(allAnswers.reduce((sum, curr) => sum + curr.ai_interview_answers.communicationScore, 0) / allAnswers.length)
      const avgConfidence = Math.round(allAnswers.reduce((sum, curr) => sum + curr.ai_interview_answers.confidenceScore, 0) / allAnswers.length)
      const avgTechnical = Math.round(allAnswers.reduce((sum, curr) => sum + curr.ai_interview_answers.technicalScore, 0) / allAnswers.length)

      // Prompt Gemini to generate next roadmaps, study resources, recommendations
      const sessionRow = await db
        .select()
        .from(aiInterviewSessions)
        .where(eq(aiInterviewSessions.id, sessionId))
        .then(r => r[0])

      const reportPrompt = `
        Compile a comprehensive performance scorecard report card for an interview session with:
        - Target Role: ${sessionRow?.targetRole}
        - Tech Stack: ${sessionRow?.technology}
        - Average Correctness: ${avgCorrectness}/100
        - Average Communication: ${avgCommunication}/100

        Return a JSON object with the following keys:
        - "recommendation": One of: "Strong Hire", "Hire", "Leaning Hire", "No Hire"
        - "roadmap": An array of objects { "step": string, "description": string } mapping next study topics.
        - "studyResources": An array of objects { "topic": string, "url": string } mapping recommended tutorials/docs.

        Do NOT wrap response in markdown. Return pure JSON.
      `

      const reportEval = await callGemini(reportPrompt, "You are a senior hiring advisor compiling career reports.", true)
      const reportData = JSON.parse(reportEval)

      // Insert report
      await db.insert(aiInterviewReports).values({
        sessionId,
        overallScore: Math.round((avgCorrectness + avgCommunication + avgConfidence + avgTechnical) / 4),
        technicalScore: avgTechnical,
        communicationScore: avgCommunication,
        confidenceScore: avgConfidence,
        codingScore: avgCorrectness,
        behavioralScore: avgConfidence,
        problemSolvingScore: avgCorrectness,
        systemDesignScore: avgTechnical,
        grammarScore: avgCommunication,
        recommendation: reportData.recommendation || "Hire",
        roadmap: reportData.roadmap || [],
        studyResources: reportData.studyResources || [],
      })

      // Update session status to completed
      await db
        .update(aiInterviewSessions)
        .set({
          status: "completed",
          overallScore: Math.round((avgCorrectness + avgCommunication + avgConfidence + avgTechnical) / 4),
          updatedAt: new Date(),
        })
        .where(eq(aiInterviewSessions.id, sessionId))
    }

    return NextResponse.json(newAnswer)
  } catch (error: any) {
    console.error("POST Submit Answer Error:", error)
    return NextResponse.json({ error: error.message || "Failed to submit answer" }, { status: 500 })
  }
}
