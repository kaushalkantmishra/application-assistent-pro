import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { tblAiHistory } from "@/db/schema";
import { UserRepository } from "@/repositories/user.repository";
import { ResumeRepository } from "@/repositories/resume.repository";
import { ResumeAiService } from "@/services/ai/resume-ai";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

async function getUserIdOrFallback() {
  const session = await auth();
  let userId = session?.user?.id;
  
  if (!userId) {
    let testUser = await UserRepository.findByEmail("test@example.com");
    if (!testUser) {
      testUser = await UserRepository.create({
        email: "test@example.com",
        name: "Test User",
        role: "job_seeker",
      });
    }
    userId = testUser.id;
  }
  
  return userId;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: resumeId } = await params;
    const userId = await getUserIdOrFallback();

    const resume = await ResumeRepository.findById(resumeId);
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const body = await request.json();
    const { jobDescriptionText, jobTitle, companyName } = body;

    if (!jobDescriptionText || jobDescriptionText.trim().length === 0) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    const optimizationResult = await ResumeAiService.optimizeEntireResume(
      resume.resumeJson as Record<string, any>,
      jobDescriptionText.trim()
    );

    // Backup current and optimized versions in tblAiHistory
    const [historyRecord] = await db.insert(tblAiHistory).values({
      userId,
      resumeId,
      originalResumeJson: resume.resumeJson,
      optimizedResumeJson: optimizationResult.optimizedResumeJson,
      jobTitle: jobTitle || null,
      companyName: companyName || null,
    }).returning();

    return NextResponse.json({
      historyId: historyRecord.id,
      explanation: optimizationResult.explanation,
      optimizedResumeJson: optimizationResult.optimizedResumeJson,
      originalResumeJson: resume.resumeJson
    });
  } catch (error: any) {
    console.error("AI Optimize Full Resume API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to optimize entire resume" }, { status: 500 });
  }
}
