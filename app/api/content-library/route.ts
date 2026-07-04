import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { resumeContentLibrary } from "@/db/schema";
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
    const contentType = searchParams.get("contentType");

    let items;
    if (contentType) {
      items = await db
        .select()
        .from(resumeContentLibrary)
        .where(
          and(
            eq(resumeContentLibrary.userId, userId),
            eq(resumeContentLibrary.contentType, contentType)
          )
        );
    } else {
      items = await db
        .select()
        .from(resumeContentLibrary)
        .where(eq(resumeContentLibrary.userId, userId));
    }

    return NextResponse.json(items);
  } catch (error: any) {
    console.error("GET Content Library Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch content items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const body = await request.json();
    const { contentType, title, content } = body;

    if (!contentType || !title || !content) {
      return NextResponse.json({ error: "contentType, title, and content are required" }, { status: 400 });
    }

    const [inserted] = await db
      .insert(resumeContentLibrary)
      .values({
        userId,
        contentType,
        title: title.trim(),
        content: content.trim(),
      })
      .returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (error: any) {
    console.error("POST Content Library Error:", error);
    return NextResponse.json({ error: error.message || "Failed to save library snippet" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    await db
      .delete(resumeContentLibrary)
      .where(
        and(
          eq(resumeContentLibrary.id, id),
          eq(resumeContentLibrary.userId, userId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Content Library Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete library snippet" }, { status: 500 });
  }
}
