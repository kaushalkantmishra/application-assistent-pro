import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { aiInterviewSessions, aiInterviewQuestions, resumes, users } from "@/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { UserRepository } from "@/repositories/user.repository"
import { callGemini } from "@/services/ai/gemini"

async function getUserIdOrFallback() {
  const session = await auth()
  let userId = session?.user?.id
  if (!userId) {
    let testUser = await UserRepository.findByEmail("test@example.com")
    if (!testUser) {
      testUser = await UserRepository.create({
        email: "test@example.com",
        name: "Test User",
        role: "job_seeker",
      })
    }
    userId = testUser.id
  }
  return userId
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const session = await db
        .select()
        .from(aiInterviewSessions)
        .where(and(eq(aiInterviewSessions.id, id), eq(aiInterviewSessions.userId, userId)))
        .then(r => r[0])
      
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 })
      }
      return NextResponse.json(session)
    }

    const list = await db
      .select()
      .from(aiInterviewSessions)
      .where(eq(aiInterviewSessions.userId, userId))
      .orderBy(desc(aiInterviewSessions.createdAt))

    return NextResponse.json(list)
  } catch (error: any) {
    console.error("GET AI Interviews Error:", error)
    return NextResponse.json({ error: error.message || "Failed to retrieve sessions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback()
    const body = await request.json()

    const {
      targetRole,
      technology,
      difficulty,
      experienceLevel,
      interviewType,
      duration,
      language,
      companyType,
      companyName,
      jobDescription,
      resumeId
    } = body

    // 1. Resolve Resume text if provided
    let resumeText = ""
    if (resumeId && resumeId !== "none") {
      const resumeRow = await db
        .select()
        .from(resumes)
        .where(eq(resumes.id, resumeId))
        .then(r => r[0])
      if (resumeRow) {
        resumeText = JSON.stringify(resumeRow.resumeJson)
      }
    }

    // 2. Create the session record
    const [newSession] = await db
      .insert(aiInterviewSessions)
      .values({
        userId,
        targetRole,
        technology,
        difficulty,
        experienceLevel,
        interviewType,
        duration,
        language,
        companyType,
        companyName,
        jobDescription,
        resumeText: resumeText || null,
        status: "in_progress",
      })
      .returning()

    // 3. Prompt Gemini to compile 5 custom questions based on configuration
    const prompt = `
      You are an elite expert technical interviewer. Compile exactly 5 interview questions for a candidate with the following configurations:
      - Target Role: ${targetRole}
      - Core Technology Stack: ${technology}
      - Difficulty: ${difficulty}
      - Experience Level: ${experienceLevel}
      - Interview Type: ${interviewType}
      - Language: ${language}
      - Company Profile: ${companyType} ${companyName ? `(${companyName})` : ""}
      ${jobDescription ? `- Target Job Description: ${jobDescription}` : ""}
      ${resumeText ? `- Candidate CV/Resume Details: ${resumeText}` : ""}

      You MUST generate exactly 5 questions and output them as a JSON array of objects.
      Each question object MUST have the following keys:
      - "questionText": The text of the question. Be specific, professional, and matching the experience level.
      - "questionType": Must be one of: "text", "mcq", "coding", "system_design", "behavioral". Note: Make at least one question of type "coding" if it is a Technical/Frontend/Backend/Full Stack interview.
      - "options": An array of strings representing options if the type is "mcq", otherwise null or empty array.
      - "expectedAnswer": A summary of the key points that should be in a correct answer.
      - "codeTemplate": A template function wrapper if the type is "coding" (e.g. "function solution() {\\n\\n}"), otherwise null.
      - "testCases": An array of objects { "input": string, "output": string } if the type is "coding", otherwise null.

      Do NOT wrap the response in markdown blocks like \`\`\`json. Return pure JSON.
    `

    const systemPrompt = "You are an expert AI Interviewer that generates structured questions in valid JSON formats."
    const geminiResponse = await callGemini(prompt, systemPrompt, true)
    
    // Parse questions and save
    const parsedQuestions = JSON.parse(geminiResponse)
    if (Array.isArray(parsedQuestions)) {
      for (const q of parsedQuestions) {
        await db.insert(aiInterviewQuestions).values({
          sessionId: newSession.id,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options || [],
          expectedAnswer: q.expectedAnswer || "",
          codeTemplate: q.codeTemplate || null,
          testCases: q.testCases || [],
        })
      }
    }

    return NextResponse.json(newSession)
  } catch (error: any) {
    console.error("POST AI Interviews Error:", error)
    return NextResponse.json({ error: error.message || "Failed to initiate session" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    await db
      .delete(aiInterviewSessions)
      .where(and(eq(aiInterviewSessions.id, id), eq(aiInterviewSessions.userId, userId)))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("DELETE AI Interview Error:", error)
    return NextResponse.json({ error: error.message || "Failed to delete session" }, { status: 500 })
  }
}
