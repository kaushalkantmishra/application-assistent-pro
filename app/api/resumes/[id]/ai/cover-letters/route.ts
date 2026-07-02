import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { tblCoverLetters } from "@/db/schema";
import { UserRepository } from "@/repositories/user.repository";
import { ResumeRepository } from "@/repositories/resume.repository";
import { CoverLetterService } from "@/services/ai/cover-letter";
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

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: resumeId } = await params;
    const userId = await getUserIdOrFallback();

    const letters = await db
      .select()
      .from(tblCoverLetters)
      .where(
        and(
          eq(tblCoverLetters.resumeId, resumeId),
          eq(tblCoverLetters.userId, userId)
        )
      )
      .orderBy(tblCoverLetters.createdAt);

    return NextResponse.json(letters);
  } catch (error: any) {
    console.error("GET Cover Letters API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch cover letters" }, { status: 500 });
  }
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
    const {
      jobDescriptionText,
      companyName,
      hiringManager,
      jobRole,
      tone,
      length,
      coverLetterText // Optional: if editing manually and saving!
    } = body;

    let text = coverLetterText;

    if (!text) {
      if (!jobDescriptionText || jobDescriptionText.trim().length === 0) {
        return NextResponse.json({ error: "Job description is required to generate a cover letter" }, { status: 400 });
      }

      // Generate cover letter via AI
      const genResult = await CoverLetterService.generateCoverLetter(
        resume.resumeJson as Record<string, any>,
        jobDescriptionText.trim(),
        { companyName, hiringManager, jobRole, tone, length }
      );
      text = genResult.coverLetterText;
    }

    // Save/Insert the cover letter record
    const [savedLetter] = await db.insert(tblCoverLetters).values({
      userId,
      resumeId,
      companyName: companyName || null,
      hiringManager: hiringManager || null,
      jobRole: jobRole || null,
      tone: tone || null,
      length: length || null,
      coverLetterText: text,
    }).returning();

    return NextResponse.json(savedLetter);
  } catch (error: any) {
    console.error("POST Cover Letters API Error Details:", {
      message: error.message,
      detail: error.detail,
      code: error.code,
      constraint: error.constraint,
    });
    return NextResponse.json({ 
      error: error.message || "Failed to handle cover letter",
      detail: error.detail,
      code: error.code,
      constraint: error.constraint
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: resumeId } = await params;
    const userId = await getUserIdOrFallback();
    
    const { searchParams } = new URL(request.url);
    const letterId = searchParams.get("letterId");

    if (!letterId) {
      return NextResponse.json({ error: "letterId is required" }, { status: 400 });
    }

    const deleted = await db
      .delete(tblCoverLetters)
      .where(
        and(
          eq(tblCoverLetters.id, letterId),
          eq(tblCoverLetters.resumeId, resumeId),
          eq(tblCoverLetters.userId, userId)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Cover letter not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: deleted[0] });
  } catch (error: any) {
    console.error("DELETE Cover Letter API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete cover letter" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  // Allow updating an existing cover letter (e.g. manual rich-text changes)
  try {
    const { id: resumeId } = await params;
    const userId = await getUserIdOrFallback();

    const body = await request.json();
    const { letterId, coverLetterText } = body;

    if (!letterId || !coverLetterText) {
      return NextResponse.json({ error: "letterId and coverLetterText are required" }, { status: 400 });
    }

    const [updated] = await db
      .update(tblCoverLetters)
      .set({
        coverLetterText,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(tblCoverLetters.id, letterId),
          eq(tblCoverLetters.resumeId, resumeId),
          eq(tblCoverLetters.userId, userId)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Cover letter not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT Cover Letter API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update cover letter" }, { status: 500 });
  }
}
