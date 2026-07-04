import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { atsReports, resumes } from "@/db/schema";
import { UserRepository } from "@/repositories/user.repository";
import { ResumeRepository } from "@/repositories/resume.repository";
import { CareerAssistantService } from "@/services/ai/career-assistant";
import { eq, desc } from "drizzle-orm";

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

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const reports = await db
      .select()
      .from(atsReports)
      .where(eq(atsReports.userId, userId))
      .orderBy(desc(atsReports.createdAt));

    return NextResponse.json(reports);
  } catch (error: any) {
    console.error("GET ATS Reports Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch ATS reports" }, { status: 550 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const body = await request.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 });
    }

    const resume = await ResumeRepository.findById(resumeId);
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const report = await CareerAssistantService.analyzeAts(resume.resumeJson as Record<string, any>);

    const [inserted] = await db
      .insert(atsReports)
      .values({
        userId,
        resumeId,
        atsScore: report.atsScore,
        reportJson: report,
      })
      .returning();

    return NextResponse.json(inserted);
  } catch (error: any) {
    console.error("POST ATS Analyzer Error:", error);
    return NextResponse.json({ error: error.message || "Failed to run ATS analyzer" }, { status: 500 });
  }
}
