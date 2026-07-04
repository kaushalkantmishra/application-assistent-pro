import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coverLetterVersions, tblCoverLetters } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: coverLetterId } = await params;
    const list = await db
      .select()
      .from(coverLetterVersions)
      .where(eq(coverLetterVersions.coverLetterId, coverLetterId));
    return NextResponse.json(list);
  } catch (error: any) {
    console.error("GET Cover Letter Versions Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch versions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: coverLetterId } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "restore") {
      const versionId = searchParams.get("versionId");
      if (!versionId) {
        return NextResponse.json({ error: "versionId is required to restore" }, { status: 400 });
      }

      const [version] = await db
        .select()
        .from(coverLetterVersions)
        .where(
          and(
            eq(coverLetterVersions.id, versionId),
            eq(coverLetterVersions.coverLetterId, coverLetterId)
          )
        );

      if (!version) {
        return NextResponse.json({ error: "Version snapshot not found" }, { status: 404 });
      }

      const [updatedLetter] = await db
        .update(tblCoverLetters)
        .set({
          coverLetterText: version.coverLetterText,
          updatedAt: new Date(),
        })
        .where(eq(tblCoverLetters.id, coverLetterId))
        .returning();

      return NextResponse.json({ success: true, action: "restored", coverLetter: updatedLetter });
    }

    const body = await request.json();
    const { versionName, coverLetterText } = body;

    if (!versionName || !coverLetterText) {
      return NextResponse.json({ error: "versionName and coverLetterText are required" }, { status: 400 });
    }

    const [inserted] = await db
      .insert(coverLetterVersions)
      .values({
        coverLetterId,
        versionName: versionName.trim(),
        coverLetterText,
      })
      .returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (error: any) {
    console.error("POST Cover Letter Version Error:", error);
    return NextResponse.json({ error: error.message || "Failed to handle version action" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: coverLetterId } = await params;
    const { searchParams } = new URL(request.url);
    const versionId = searchParams.get("versionId");

    if (!versionId) {
      return NextResponse.json({ error: "versionId is required" }, { status: 400 });
    }

    await db
      .delete(coverLetterVersions)
      .where(
        and(
          eq(coverLetterVersions.id, versionId),
          eq(coverLetterVersions.coverLetterId, coverLetterId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Cover Letter Version Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete version" }, { status: 500 });
  }
}
