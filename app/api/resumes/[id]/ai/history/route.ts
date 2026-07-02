import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { tblAiHistory, tblJobDescriptions, resumes } from "@/db/schema";
import { UserRepository } from "@/repositories/user.repository";
import { ResumeRepository } from "@/repositories/resume.repository";
import { eq, and, desc, like, or } from "drizzle-orm";

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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    // Fetch optimization checkpoints
    const history = await db
      .select()
      .from(tblAiHistory)
      .where(
        and(
          eq(tblAiHistory.resumeId, resumeId),
          eq(tblAiHistory.userId, userId)
        )
      )
      .orderBy(desc(tblAiHistory.createdAt));

    // Fetch previous job descriptions
    let jobDescQuery = db
      .select()
      .from(tblJobDescriptions)
      .where(eq(tblJobDescriptions.userId, userId));

    if (search.trim().length > 0) {
      // If search query is provided, search job descriptions by role, company, or text content
      const searchPattern = `%${search}%`;
      jobDescQuery = db
        .select()
        .from(tblJobDescriptions)
        .where(
          and(
            eq(tblJobDescriptions.userId, userId),
            or(
              like(tblJobDescriptions.companyName, searchPattern),
              like(tblJobDescriptions.jobRole, searchPattern),
              like(tblJobDescriptions.jobDescriptionText, searchPattern)
            )
          )
        );
    }

    const jobDescriptions = await jobDescQuery.orderBy(desc(tblJobDescriptions.createdAt));

    return NextResponse.json({
      history,
      jobDescriptions,
    });
  } catch (error: any) {
    console.error("GET AI History API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch history" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: resumeId } = await params;
    const userId = await getUserIdOrFallback();

    const body = await request.json();
    const { action, historyId, type } = body;

    if (action !== "restore") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!historyId) {
      return NextResponse.json({ error: "historyId is required to restore" }, { status: 400 });
    }

    // Fetch the history snapshot
    const [snapshot] = await db
      .select()
      .from(tblAiHistory)
      .where(
        and(
          eq(tblAiHistory.id, historyId),
          eq(tblAiHistory.resumeId, resumeId),
          eq(tblAiHistory.userId, userId)
        )
      );

    if (!snapshot) {
      return NextResponse.json({ error: "History snapshot not found" }, { status: 404 });
    }

    // Determine which json to restore
    const targetJson = type === "original" ? snapshot.originalResumeJson : snapshot.optimizedResumeJson;

    // Update active resume in database
    const updatedResume = await ResumeRepository.updateJson(resumeId, targetJson as Record<string, any>);

    return NextResponse.json({
      success: true,
      resume: updatedResume,
    });
  } catch (error: any) {
    console.error("POST Restore API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to restore version" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: resumeId } = await params;
    const userId = await getUserIdOrFallback();

    const { searchParams } = new URL(request.url);
    const historyId = searchParams.get("historyId");
    const jobDescId = searchParams.get("jobDescId");

    if (historyId) {
      // Delete specific checkpoint snapshot
      const deleted = await db
        .delete(tblAiHistory)
        .where(
          and(
            eq(tblAiHistory.id, historyId),
            eq(tblAiHistory.resumeId, resumeId),
            eq(tblAiHistory.userId, userId)
          )
        )
        .returning();
      return NextResponse.json({ success: true, deleted: deleted[0] });
    } else if (jobDescId) {
      // Delete specific job description
      const deleted = await db
        .delete(tblJobDescriptions)
        .where(
          and(
            eq(tblJobDescriptions.id, jobDescId),
            eq(tblJobDescriptions.userId, userId)
          )
        )
        .returning();
      return NextResponse.json({ success: true, deleted: deleted[0] });
    } else {
      return NextResponse.json({ error: "historyId or jobDescId is required" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("DELETE AI History API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete history record" }, { status: 500 });
  }
}
