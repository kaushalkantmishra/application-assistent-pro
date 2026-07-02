import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { tblJobDescriptions, tblAiResumeAnalysis, resumes } from "@/db/schema";
import { UserRepository } from "@/repositories/user.repository";
import { ResumeRepository } from "@/repositories/resume.repository";
import { ResumeAiService } from "@/services/ai/resume-ai";
import { eq, and } from "drizzle-orm";

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

    // Fetch the active resume content
    const resume = await ResumeRepository.findById(resumeId);
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const body = await request.json();
    const { jobDescriptionText, companyName, jobRole } = body;

    if (!jobDescriptionText || jobDescriptionText.trim().length === 0) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    // 1. Save Job Description
    const [jobDesc] = await db.insert(tblJobDescriptions).values({
      userId,
      companyName: companyName || null,
      jobRole: jobRole || null,
      jobDescriptionText: jobDescriptionText.trim(),
    }).returning();

    // 2. Call AI Analysis service
    const analysisResult = await ResumeAiService.analyzeResume(
      resume.resumeJson as Record<string, any>,
      jobDescriptionText.trim()
    );

    // 3. Save AI Analysis results
    const [savedAnalysis] = await db.insert(tblAiResumeAnalysis).values({
      userId,
      resumeId,
      jobDescriptionId: jobDesc.id,
      overallMatchScore: analysisResult.overallMatchScore,
      technicalMatchPercent: analysisResult.technicalMatchPercent,
      experienceMatchPercent: analysisResult.experienceMatchPercent,
      skillsMatchPercent: analysisResult.skillsMatchPercent,
      educationMatchPercent: analysisResult.educationMatchPercent,
      keywordMatchPercent: analysisResult.keywordMatchPercent,
      atsScore: analysisResult.atsScore,
      analysisJson: analysisResult,
    }).returning();

    return NextResponse.json({
      analysis: savedAnalysis,
      jobDescription: jobDesc,
      report: analysisResult
    });
  } catch (error: any) {
    console.error("AI Analyze Resume API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze resume" }, { status: 500 });
  }
}
