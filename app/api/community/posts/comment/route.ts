import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { communityComments, communityPosts } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { UserRepository } from "@/repositories/user.repository"

async function getUserIdOrFallback() {
  const session = await auth()
  let userId = session?.user?.id
  if (!userId) {
    let testUser = await UserRepository.findByEmail("test@example.com")
    if (!testUser) {
      testUser = await UserRepository.create({
        email: "test@example.com",
        name: "Test User",
        role: "job_seeker",
      })
    }
    userId = testUser.id
  }
  return userId
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback()
    const { postId, commentText } = await request.json()

    if (!postId || !commentText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 1. Insert comment
    const [newComment] = await db
      .insert(communityComments)
      .values({
        postId,
        userId,
        commentText,
      })
      .returning()

    // 2. Increment comment count on post
    await db
      .update(communityPosts)
      .set({
        commentsCount: sql`comments_count + 1`,
      })
      .where(eq(communityPosts.id, postId))

    return NextResponse.json(newComment)
  } catch (error: any) {
    console.error("POST Community Comment Error:", error)
    return NextResponse.json({ error: error.message || "Failed to submit comment" }, { status: 500 })
  }
}
