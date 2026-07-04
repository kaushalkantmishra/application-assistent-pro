import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const list = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))

    return NextResponse.json(list)
  } catch (error: any) {
    console.error("GET Admin Users Error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, role, suspend } = await request.json()

    if (suspend !== undefined) {
      // Suspend/activate toggle by setting/removing deletedAt field
      const [updated] = await db
        .update(users)
        .set({
          deletedAt: suspend ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning()
      return NextResponse.json(updated)
    }

    if (role !== undefined) {
      const [updated] = await db
        .update(users)
        .set({
          role,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning()
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
  } catch (error: any) {
    console.error("POST Admin Users Error:", error)
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 })
  }
}
