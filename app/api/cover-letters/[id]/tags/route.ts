import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coverLetterTagMappings } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: coverLetterId } = await params;
    const mappings = await db
      .select()
      .from(coverLetterTagMappings)
      .where(eq(coverLetterTagMappings.coverLetterId, coverLetterId));
    return NextResponse.json(mappings);
  } catch (error: any) {
    console.error("GET Cover Letter Tags Mapping Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch mappings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: coverLetterId } = await params;
    const body = await request.json();
    const { tagId } = body;

    if (!tagId) {
      return NextResponse.json({ error: "Tag ID is required" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(coverLetterTagMappings)
      .where(
        and(
          eq(coverLetterTagMappings.coverLetterId, coverLetterId),
          eq(coverLetterTagMappings.tagId, tagId)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json({ success: true, action: "already_exists", mapping: existing[0] });
    }

    const [inserted] = await db
      .insert(coverLetterTagMappings)
      .values({
        coverLetterId,
        tagId,
      })
      .returning();

    return NextResponse.json({ success: true, action: "tagged", mapping: inserted }, { status: 201 });
  } catch (error: any) {
    console.error("POST Cover Letter Tags Mapping Error:", error);
    return NextResponse.json({ error: error.message || "Failed to map tag" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: coverLetterId } = await params;
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get("tagId");

    if (tagId) {
      await db
        .delete(coverLetterTagMappings)
        .where(
          and(
            eq(coverLetterTagMappings.coverLetterId, coverLetterId),
            eq(coverLetterTagMappings.tagId, tagId)
          )
        );
    } else {
      await db
        .delete(coverLetterTagMappings)
        .where(eq(coverLetterTagMappings.coverLetterId, coverLetterId));
    }

    return NextResponse.json({ success: true, action: "untagged" });
  } catch (error: any) {
    console.error("DELETE Cover Letter Tags Mapping Error:", error);
    return NextResponse.json({ error: error.message || "Failed to unmap tag" }, { status: 500 });
  }
}
