import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { communityPosts, users } from "@/db/schema"
import { eq, desc, and } from "drizzle-orm"
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let query = db
      .select({
        id: communityPosts.id,
        title: communityPosts.title,
        category: communityPosts.category,
        content: communityPosts.content,
        likesCount: communityPosts.likesCount,
        commentsCount: communityPosts.commentsCount,
        createdAt: communityPosts.createdAt,
        author: {
          name: users.name,
          image: users.image,
        }
      })
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.userId, users.id))

    if (category && category !== "All") {
      query = query.where(eq(communityPosts.category, category)) as any
    }

    const list = await query.orderBy(desc(communityPosts.createdAt))
    return NextResponse.json(list)
  } catch (error: any) {
    console.error("GET Community Posts Error:", error)
    return NextResponse.json({ error: error.message || "Failed to load posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback()
    const { title, category, content } = await request.json()

    if (!title || !category || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [newPost] = await db
      .insert(communityPosts)
      .values({
        title,
        category,
        content,
        userId,
        likesCount: 0,
        commentsCount: 0,
      })
      .returning()

    return NextResponse.json(newPost)
  } catch (error: any) {
    console.error("POST Create Post Error:", error)
    return NextResponse.json({ error: error.message || "Failed to create post" }, { status: 500 })
  }
}
