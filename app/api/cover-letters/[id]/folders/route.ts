import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coverLetterFolderMappings } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: coverLetterId } = await params;
    const mappings = await db
      .select()
      .from(coverLetterFolderMappings)
      .where(eq(coverLetterFolderMappings.coverLetterId, coverLetterId));
    return NextResponse.json(mappings);
  } catch (error: any) {
    console.error("GET Cover Letter Folders Mapping Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch mappings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: coverLetterId } = await params;
    const body = await request.json();
    const { folderId } = body;

    if (!folderId) {
      return NextResponse.json({ error: "Folder ID is required" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(coverLetterFolderMappings)
      .where(
        and(
          eq(coverLetterFolderMappings.coverLetterId, coverLetterId),
          eq(coverLetterFolderMappings.folderId, folderId)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json({ success: true, action: "already_exists", mapping: existing[0] });
    }

    const [inserted] = await db
      .insert(coverLetterFolderMappings)
      .values({
        coverLetterId,
        folderId,
      })
      .returning();

    return NextResponse.json({ success: true, action: "mapped", mapping: inserted }, { status: 201 });
  } catch (error: any) {
    console.error("POST Cover Letter Folders Mapping Error:", error);
    return NextResponse.json({ error: error.message || "Failed to map folder" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: coverLetterId } = await params;
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");

    if (folderId) {
      await db
        .delete(coverLetterFolderMappings)
        .where(
          and(
            eq(coverLetterFolderMappings.coverLetterId, coverLetterId),
            eq(coverLetterFolderMappings.folderId, folderId)
          )
        );
    } else {
      await db
        .delete(coverLetterFolderMappings)
        .where(eq(coverLetterFolderMappings.coverLetterId, coverLetterId));
    }

    return NextResponse.json({ success: true, action: "unmapped" });
  } catch (error: any) {
    console.error("DELETE Cover Letter Folders Mapping Error:", error);
    return NextResponse.json({ error: error.message || "Failed to unmap folder" }, { status: 550 });
  }
}
