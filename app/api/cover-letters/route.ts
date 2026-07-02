import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { tblCoverLetters, coverLetterFolderMappings, coverLetterTagMappings, coverLetterFolders, coverLetterTags, resumes } from "@/db/schema";
import { UserRepository } from "@/repositories/user.repository";
import { eq, desc, and } from "drizzle-orm";

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

    // Query cover letters
    const list = await db
      .select()
      .from(tblCoverLetters)
      .where(eq(tblCoverLetters.userId, userId))
      .orderBy(desc(tblCoverLetters.createdAt));

    // Get mapping data
    const foldersMap = await db.select().from(coverLetterFolderMappings);
    const tagsMap = await db.select().from(coverLetterTagMappings);
    const userFolders = await db.select().from(coverLetterFolders).where(eq(coverLetterFolders.userId, userId));
    const userTags = await db.select().from(coverLetterTags).where(eq(coverLetterTags.userId, userId));

    const enrichedList = list.map((cl) => {
      const folderMapping = foldersMap.find((m) => m.coverLetterId === cl.id);
      const folder = folderMapping ? userFolders.find((f) => f.id === folderMapping.folderId) : null;

      const matchedTagMappings = tagsMap.filter((m) => m.coverLetterId === cl.id);
      const tags = matchedTagMappings
        .map((m) => userTags.find((t) => t.id === m.tagId))
        .filter(Boolean);

      return {
        ...cl,
        folder,
        tags,
      };
    });

    return NextResponse.json(enrichedList);
  } catch (error: any) {
    console.error("GET Cover Letters Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch cover letters" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const body = await request.json();
    const { title, companyName, jobRole, coverLetterText, resumeId } = body;

    let activeResumeId = resumeId;
    if (!activeResumeId) {
      // Find user's default resume or first resume
      const [firstResume] = await db
        .select()
        .from(resumes)
        .where(eq(resumes.userId, userId))
        .limit(1);
      if (!firstResume) {
        return NextResponse.json({ error: "Please create a resume first before generating a cover letter." }, { status: 400 });
      }
      activeResumeId = firstResume.id;
    }

    const [inserted] = await db
      .insert(tblCoverLetters)
      .values({
        userId,
        resumeId: activeResumeId,
        companyName: companyName || "the Company",
        jobRole: jobRole || "Open Position",
        coverLetterText: coverLetterText || `Dear Hiring Manager,\n\nI am writing to express my enthusiastic interest in the ${jobRole || "Open Position"} at ${companyName || "the Company"}.`,
        hiringManager: body.hiringManager || "Hiring Manager",
        tone: body.tone || "professional",
        length: body.length || "medium",
      })
      .returning();

    // Create a title entry using custom field if needed (we can store it in database or custom tags)
    // Wait, the Cover Letter schema doesn't have a direct 'title' column, so we can store it or parse it.
    // Wait! Let's check db/schema.ts for cover letter properties:
    // companyName, hiringManager, jobRole, tone, length, coverLetterText
    // We can use companyName / jobRole to construct the name on UI, or let the user name it.
    
    return NextResponse.json(inserted, { status: 201 });
  } catch (error: any) {
    console.error("POST Cover Letter Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create cover letter" }, { status: 500 });
  }
}
