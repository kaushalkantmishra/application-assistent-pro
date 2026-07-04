import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { resumeVersions, resumes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: resumeId } = await params;
    const list = await db
      .select()
      .from(resumeVersions)
      .where(eq(resumeVersions.resumeId, resumeId));
    return NextResponse.json(list);
  } catch (error: any) {
    console.error("GET Resume Versions Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch versions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: resumeId } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "restore") {
      const versionId = searchParams.get("versionId");
      if (!versionId) {
        return NextResponse.json({ error: "versionId is required to restore" }, { status: 400 });
      }

      // Fetch the version content
      const [version] = await db
        .select()
        .from(resumeVersions)
        .where(and(eq(resumeVersions.id, versionId), eq(resumeVersions.resumeId, resumeId)));

      if (!version) {
        return NextResponse.json({ error: "Version snapshot not found" }, { status: 404 });
      }

      // Restore into resumes table
      const [updatedResume] = await db
        .update(resumes)
        .set({
          resumeJson: version.resumeJson,
          updatedAt: new Date(),
        })
        .where(eq(resumes.id, resumeId))
        .returning();

      return NextResponse.json({ success: true, action: "restored", resume: updatedResume });
    }

    // Otherwise create a new version snapshot
    const body = await request.json();
    const { versionName, resumeJson } = body;

    if (!versionName || !resumeJson) {
      return NextResponse.json({ error: "versionName and resumeJson are required" }, { status: 400 });
    }

    const [inserted] = await db
      .insert(resumeVersions)
      .values({
        resumeId,
        versionName: versionName.trim(),
        resumeJson,
      })
      .returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (error: any) {
    console.error("POST Resume Version Error:", error);
    return NextResponse.json({ error: error.message || "Failed to handle version action" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: resumeId } = await params;
    const { searchParams } = new URL(request.url);
    const versionId = searchParams.get("versionId");

    if (!versionId) {
      return NextResponse.json({ error: "versionId is required" }, { status: 400 });
    }

    await db
      .delete(resumeVersions)
      .where(and(eq(resumeVersions.id, versionId), eq(resumeVersions.resumeId, resumeId)));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Resume Version Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete version" }, { status: 500 });
  }
}
