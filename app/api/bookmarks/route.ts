import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";
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

    const list = await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId));

    return NextResponse.json(list);
  } catch (error: any) {
    console.error("GET Bookmarks API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch bookmarks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const body = await request.json();
    const { itemId, itemType } = body;

    if (!itemId || !itemType) {
      return NextResponse.json({ error: "itemId and itemType are required" }, { status: 400 });
    }

    // Toggle logic: check if bookmark exists
    const existing = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.itemId, itemId),
          eq(bookmarks.itemType, itemType)
        )
      );

    if (existing.length > 0) {
      // Remove bookmark
      await db
        .delete(bookmarks)
        .where(eq(bookmarks.id, existing[0].id));

      return NextResponse.json({ success: true, action: "removed" });
    } else {
      // Add bookmark
      const [inserted] = await db
        .insert(bookmarks)
        .values({
          userId,
          itemId,
          itemType,
        })
        .returning();

      return NextResponse.json({ success: true, action: "added", bookmark: inserted });
    }
  } catch (error: any) {
    console.error("POST Bookmarks API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to toggle bookmark" }, { status: 500 });
  }
}
