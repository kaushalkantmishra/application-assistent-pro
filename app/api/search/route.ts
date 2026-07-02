import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { users, communityPosts } from "@/db/schema"
import { eq, or, ilike } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""

    if (!q.trim()) {
      return NextResponse.json({ users: [], posts: [] })
    }

    // 1. Search Users
    const matchedUsers = await db
      .select({ id: users.id, name: users.name, email: users.email, image: users.image })
      .from(users)
      .where(or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`)))
      .limit(10)

    // 2. Search Posts
    const matchedPosts = await db
      .select({ id: communityPosts.id, title: communityPosts.title, category: communityPosts.category })
      .from(communityPosts)
      .where(or(ilike(communityPosts.title, `%${q}%`), ilike(communityPosts.content, `%${q}%`)))
      .limit(10)

    return NextResponse.json({
      users: matchedUsers,
      posts: matchedPosts,
    })
  } catch (error: any) {
    console.error("GET Global Search Error:", error)
    return NextResponse.json({ error: error.message || "Search failed" }, { status: 500 })
  }
}
