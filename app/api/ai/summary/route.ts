import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ResumeRepository } from "@/repositories/resume.repository";
import { CareerAssistantService } from "@/services/ai/career-assistant";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeId, targetRole } = body;

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 });
    }

    const resume = await ResumeRepository.findById(resumeId);
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const summaries = await CareerAssistantService.generateSummary(
      resume.resumeJson as Record<string, any>,
      targetRole
    );

    return NextResponse.json(summaries);
  } catch (error: any) {
    console.error("POST Summary Generator Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate summary content" }, { status: 500 });
  }
}
