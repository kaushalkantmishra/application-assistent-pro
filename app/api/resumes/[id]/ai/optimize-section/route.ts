import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
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
    await getUserIdOrFallback();

    const resume = await ResumeRepository.findById(resumeId);
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const body = await request.json();
    const { sectionId, jobDescriptionText } = body;

    if (!sectionId) {
      return NextResponse.json({ error: "sectionId is required" }, { status: 400 });
    }

    if (!jobDescriptionText || jobDescriptionText.trim().length === 0) {
      return NextResponse.json({ error: "Job description text is required" }, { status: 400 });
    }

    const result = await ResumeAiService.optimizeSection(
      resume.resumeJson as Record<string, any>,
      sectionId,
      jobDescriptionText.trim()
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Optimize Section API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to optimize section" }, { status: 500 });
  }
}
