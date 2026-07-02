import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { resumeTags, coverLetterTags } from "@/db/schema";
import { UserRepository } from "@/repositories/user.repository";
import { eq, and } from "drizzle-orm";

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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "resume"; // 'resume' or 'cover-letter'

    if (type === "cover-letter") {
      const tagsList = await db
        .select()
        .from(coverLetterTags)
        .where(eq(coverLetterTags.userId, userId));
      return NextResponse.json(tagsList);
    } else {
      const tagsList = await db
        .select()
        .from(resumeTags)
        .where(eq(resumeTags.userId, userId));
      return NextResponse.json(tagsList);
    }
  } catch (error: any) {
    console.error("GET Tags Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch tags" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const body = await request.json();
    const { name, type } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }

    if (type === "cover-letter") {
      const [inserted] = await db
        .insert(coverLetterTags)
        .values({
          userId,
          name: name.trim(),
        })
        .returning();
      return NextResponse.json(inserted, { status: 201 });
    } else {
      const [inserted] = await db
        .insert(resumeTags)
        .values({
          userId,
          name: name.trim(),
        })
        .returning();
      return NextResponse.json(inserted, { status: 201 });
    }
  } catch (error: any) {
    console.error("POST Tag Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create tag" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "resume";

    if (!id) {
      return NextResponse.json({ error: "Tag ID is required" }, { status: 400 });
    }

    if (type === "cover-letter") {
      await db
        .delete(coverLetterTags)
        .where(and(eq(coverLetterTags.id, id), eq(coverLetterTags.userId, userId)));
      return NextResponse.json({ success: true });
    } else {
      await db
        .delete(resumeTags)
        .where(and(eq(resumeTags.id, id), eq(resumeTags.userId, userId)));
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    console.error("DELETE Tag Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete tag" }, { status: 500 });
  }
}
