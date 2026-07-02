import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { tblCoverLetters, coverLetterVersions } from "@/db/schema";
import { UserRepository } from "@/repositories/user.repository";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

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
    const userId = await getUserIdOrFallback();
    const { id } = await params;

    const [coverLetter] = await db
      .select()
      .from(tblCoverLetters)
      .where(and(eq(tblCoverLetters.id, id), eq(tblCoverLetters.userId, userId)));

    if (!coverLetter) {
      return NextResponse.json({ error: "Cover letter not found" }, { status: 404 });
    }

    return NextResponse.json(coverLetter);
  } catch (error: any) {
    console.error("GET Cover Letter Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch cover letter" }, { status: 550 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserIdOrFallback();
    const { id } = await params;
    const body = await request.json();

    const updateFields: any = {
      updatedAt: new Date(),
    };

    if (body.coverLetterText !== undefined) updateFields.coverLetterText = body.coverLetterText;
    if (body.companyName !== undefined) updateFields.companyName = body.companyName;
    if (body.hiringManager !== undefined) updateFields.hiringManager = body.hiringManager;
    if (body.jobRole !== undefined) updateFields.jobRole = body.jobRole;
    if (body.tone !== undefined) updateFields.tone = body.tone;
    if (body.length !== undefined) updateFields.length = body.length;

    const [updated] = await db
      .update(tblCoverLetters)
      .set(updateFields)
      .where(and(eq(tblCoverLetters.id, id), eq(tblCoverLetters.userId, userId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Cover letter not found" }, { status: 404 });
    }

    // Auto-create a version snapshot for cover letter if it's the first or 1 min has passed
    try {
      const lastVersion = await db
        .select()
        .from(coverLetterVersions)
        .where(eq(coverLetterVersions.coverLetterId, id))
        .orderBy(coverLetterVersions.createdAt)
        .limit(1)
        .then((r) => r[0]);

      const shouldCreateVersion =
        !lastVersion ||
        (lastVersion.coverLetterText !== body.coverLetterText &&
          Date.now() - new Date(lastVersion.createdAt).getTime() > 60000);

      if (shouldCreateVersion && body.coverLetterText) {
        await db.insert(coverLetterVersions).values({
          coverLetterId: id,
          versionName: `Auto-saved - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          coverLetterText: body.coverLetterText,
        });
      }
    } catch (verErr) {
      console.error("Cover letter auto-version error:", verErr);
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT Cover Letter Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update cover letter" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserIdOrFallback();
    const { id } = await params;

    await db
      .delete(tblCoverLetters)
      .where(and(eq(tblCoverLetters.id, id), eq(tblCoverLetters.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Cover Letter Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete cover letter" }, { status: 500 });
  }
}
