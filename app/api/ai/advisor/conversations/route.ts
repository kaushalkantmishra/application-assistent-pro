import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { aiConversations } from "@/db/schema";
import { UserRepository } from "@/repositories/user.repository";
import { eq, and, desc } from "drizzle-orm";

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
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId))
      .orderBy(desc(aiConversations.updatedAt));

    return NextResponse.json(list);
  } catch (error: any) {
    console.error("GET Conversations Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch conversations" }, { status: 550 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 450 });
    }

    await db
      .delete(aiConversations)
      .where(and(eq(aiConversations.id, id), eq(aiConversations.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Conversation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete conversation" }, { status: 550 });
  }
}
