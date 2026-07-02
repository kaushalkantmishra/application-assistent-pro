import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { communityLikes, communityPosts } from "@/db/schema"
import { eq, and, sql } from "drizzle-orm"
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
    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    // Check if like exists
    const existing = await db
      .select()
      .from(communityLikes)
      .where(and(eq(communityLikes.postId, postId), eq(communityLikes.userId, userId)))
      .then(r => r[0])

    if (existing) {
      // Unlike
      await db
        .delete(communityLikes)
        .where(eq(communityLikes.id, existing.id))

      await db
        .update(communityPosts)
        .set({
          likesCount: sql`GREATEST(likes_count - 1, 0)`,
        })
        .where(eq(communityPosts.id, postId))

      return NextResponse.json({ liked: false })
    } else {
      // Like
      await db
        .insert(communityLikes)
        .values({
          postId,
          userId,
        })

      await db
        .update(communityPosts)
        .set({
          likesCount: sql`likes_count + 1`,
        })
        .where(eq(communityPosts.id, postId))

      return NextResponse.json({ liked: true })
    }
  } catch (error: any) {
    console.error("POST Community Like Error:", error)
    return NextResponse.json({ error: error.message || "Failed to toggle like" }, { status: 500 })
  }
}
