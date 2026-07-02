import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { resumeFolderMappings } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: resumeId } = await params;
    const mappings = await db
      .select()
      .from(resumeFolderMappings)
      .where(eq(resumeFolderMappings.resumeId, resumeId));
    return NextResponse.json(mappings);
  } catch (error: any) {
    console.error("GET Resume Folders Mapping Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch mappings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: resumeId } = await params;
    const body = await request.json();
    const { folderId } = body;

    if (!folderId) {
      return NextResponse.json({ error: "Folder ID is required" }, { status: 400 });
    }

    // Check if mapping already exists
    const existing = await db
      .select()
      .from(resumeFolderMappings)
      .where(
        and(
          eq(resumeFolderMappings.resumeId, resumeId),
          eq(resumeFolderMappings.folderId, folderId)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json({ success: true, action: "already_exists", mapping: existing[0] });
    }

    // Create new mapping
    const [inserted] = await db
      .insert(resumeFolderMappings)
      .values({
        resumeId,
        folderId,
      })
      .returning();

    return NextResponse.json({ success: true, action: "mapped", mapping: inserted }, { status: 201 });
  } catch (error: any) {
    console.error("POST Resume Folders Mapping Error:", error);
    return NextResponse.json({ error: error.message || "Failed to map folder" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: resumeId } = await params;
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");

    if (folderId) {
      // Unmap specific folder
      await db
        .delete(resumeFolderMappings)
        .where(
          and(
            eq(resumeFolderMappings.resumeId, resumeId),
            eq(resumeFolderMappings.folderId, folderId)
          )
        );
    } else {
      // Unmap all folders for this resume
      await db
        .delete(resumeFolderMappings)
        .where(eq(resumeFolderMappings.resumeId, resumeId));
    }

    return NextResponse.json({ success: true, action: "unmapped" });
  } catch (error: any) {
    console.error("DELETE Resume Folders Mapping Error:", error);
    return NextResponse.json({ error: error.message || "Failed to unmap folder" }, { status: 500 });
  }
}
